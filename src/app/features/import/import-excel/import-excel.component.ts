import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  X,
  Download,
  Eye,
  RefreshCw,
  AlertCircle,
  Info,
  Check,
  FileText,
  Database,
  Activity,
  BarChart3,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  XCircle,
  Settings,
  FileUp,
  FileCheck
} from 'lucide-angular';

interface ImportResult {
  total: number;
  successCount: number;
  errorCount: number;
  warningCount?: number;
  totalProcessed: number;
  success?: number;
  errors?: number;
  warnings?: number;
}

interface ImportError {
  row: number;
  column: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  data?: string;
  suggestion?: string;
}

interface ImportStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress?: number;
  icon: any;
}

@Component({
  selector: 'app-import-excel',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './import-excel.component.html',
  styleUrls: ['./import-excel.component.scss'],
})
export class ImportExcelComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Icons
  readonly Upload = Upload;
  readonly FileSpreadsheet = FileSpreadsheet;
  readonly CheckCircle = CheckCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly X = X;
  readonly Download = Download;
  readonly Eye = Eye;
  readonly RefreshCw = RefreshCw;
  readonly AlertCircle = AlertCircle;
  readonly Info = Info;
  readonly Check = Check;
  readonly FileText = FileText;
  readonly Database = Database;
  readonly Activity = Activity;
  readonly BarChart3 = BarChart3;
  readonly TrendingUp = TrendingUp;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly RotateCcw = RotateCcw;
  readonly XCircle = XCircle;
  readonly Settings = Settings;
  readonly FileUp = FileUp;
  readonly FileCheck = FileCheck;

  // États de l'interface
  currentStep = 1;
  isLoading = false;
  isProcessing = false;
  isDragOver = false;
  showPreview = false;

  // Gestion des fichiers
  uploadedFile: File | null = null;
  isFileValid = false;
  maxFileSize = 10 * 1024 * 1024; // 10MB

  // Aperçu des données
  previewData: any[][] = [];
  previewHeaders: string[] = [];

  // Résultats d'import
  importResult: ImportResult | null = null;
  importErrors: ImportError[] = [];

  // Variables pour le traitement
  processedRows = 0;
  totalRows = 0;
  progressPercentage = 0;
  currentProcessingMessage = 'Préparation des données...';

  // Configuration d'importation
  importConfig = {
    headerRow: '1',
    delimiter: ',',
    skipEmptyRows: true,
    validateData: true
  };

  // Validation
  validationErrors: ImportError[] = [];

  // Étapes du processus
  importSteps: ImportStep[] = [
    {
      id: 1,
      title: 'Sélection du fichier',
      description: 'Choisissez le fichier Excel ou CSV à importer',
      status: 'active',
      icon: FileUp
    },
    {
      id: 2,
      title: 'Configuration',
      description: 'Paramètres d\'importation et mapping des colonnes',
      status: 'pending',
      icon: Settings
    },
    {
      id: 3,
      title: 'Aperçu',
      description: 'Vérification des données avant importation',
      status: 'pending',
      icon: Eye
    },
    {
      id: 4,
      title: 'Traitement',
      description: 'Import des données dans le système',
      status: 'pending',
      icon: Activity
    }
  ];

  // Templates disponibles
  templates = [
    {
      id: 1,
      name: 'Transactions Standard',
      version: '1.0',
      description: 'Pour l\'import des transactions bancaires standard',
      columns: ['Date', 'Référence', 'Montant', 'Devise', 'Client', 'Agence']
    },
    {
      id: 2,
      name: 'Clients',
      version: '1.2',
      description: 'Pour l\'import des données clients',
      columns: ['Matricule', 'Nom', 'Prénom', 'Email', 'Téléphone']
    },
    {
      id: 3,
      name: 'Apurements',
      version: '2.0',
      description: 'Pour l\'import des dossiers d\'apurement',
      columns: ['Référence', 'Date', 'Montant', 'Client', 'Statut']
    }
  ];

  // Colonnes requises
  requiredColumns = [
    'RESEAU',
    'AGENCE',
    'Matricule CLIENT',
    'Numéro de carte',
    'NOM CLIENT',
    'PRENOM CLIENT',
    'TELEPHONE',
    'EMAIL',
    'Cumul Montant transaction',
    'Mois Voyage',
    'ANNEE Voyage'
  ];

  ngOnInit() {
    // Initialiser les données si nécessaire
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private handleFile(file: File) {
    if (this.validateFileType(file)) {
      this.uploadedFile = file;
      this.loadPreview(file);
    }
  }

  private validateFileType(file: File): boolean {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Type de fichier non supporté. Veuillez utiliser un fichier Excel (.xlsx ou .xls) ou CSV');
      return false;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert('Le fichier est trop volumineux (max 50MB)');
      return false;
    }

    return true;
  }

  private loadPreview(file: File) {
    // Simulation de lecture du fichier et génération d'aperçu
    setTimeout(() => {
      this.previewHeaders = this.requiredColumns.slice(0, 6); // Show first 6 columns
      this.previewData = [
        [
          'RES001',
          'Douala Centre',
          'EMP001',
          '1234****5678',
          'DUPONT Jean',
          'DUPONT',
        ],
        [
          'RES002',
          'Yaoundé Nlongkak',
          'EMP002',
          '5678****1234',
          'MARTIN Marie',
          'MARTIN',
        ],
        [
          'RES001',
          'Bafoussam',
          'EMP003',
          '9012****3456',
          'BERNARD Paul',
          'BERNARD',
        ],
        [
          'RES003',
          'Garoua',
          'EMP004',
          '3456****7890',
          'DURAND Sophie',
          'DURAND',
        ],
      ];
      this.totalRows = 1250; // Simulate total rows
      this.isFileValid = true;
    }, 1000);
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
  }

  validateFile() {
    if (!this.uploadedFile) return;

    // Simulate validation
    setTimeout(() => {
      this.isFileValid = true;
      this.importErrors = [
        {
          row: 15,
          column: 'EMAIL',
          message: "Format d'email invalide",
          type: 'warning',
        },
        {
          row: 23,
          column: 'Cumul Montant transaction',
          message: 'Valeur manquante',
          type: 'error',
        },
      ];

      alert(
        'Validation terminée. Le fichier contient quelques avertissements mais peut être importé.'
      );
    }, 2000);
  }

  goToStep(step: number) {
    if (step < 1 || step > this.importSteps.length) return;

    // Mettre à jour les états des étapes
    this.importSteps.forEach(s => {
      if (s.id === step) {
        s.status = 'active';
      } else if (s.id < step) {
        s.status = 'completed';
      } else {
        s.status = 'pending';
      }
    });

    this.currentStep = step;
  }

  nextStep() {
    if (this.currentStep < this.importSteps.length) {
      this.goToStep(this.currentStep + 1);

      // Si on passe à l'étape de traitement, démarrer l'import
      if (this.currentStep === 4) {
        this.startImport();
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  getStepClass(stepId: number): string {
    const step = this.importSteps.find(s => s.id === stepId);
    if (!step) return '';

    if (step.status === 'completed') {
      return 'bg-green-500 border-green-500 text-white';
    } else if (step.status === 'active') {
      return 'bg-afriland-100 border-afriland-500 text-afriland-600';
    } else if (step.status === 'error') {
      return 'bg-red-100 border-red-500 text-red-600';
    } else {
      return 'bg-gray-100 border-gray-300 text-gray-500';
    }
  }

  canProceedToNextStep(): boolean {
    // Validation de chaque étape
    switch (this.currentStep) {
      case 1:
        return !!this.uploadedFile;
      case 2:
        return true; // Toujours autorisé après configuration
      case 3:
        return true; // Toujours autorisé après aperçu
      default:
        return false;
    }
  }

  startImport() {
    if (!this.uploadedFile || !this.isFileValid) return;

    this.isProcessing = true;
    this.processedRows = 0;
    this.progressPercentage = 0;

    // Simulation du processus d'import
    const interval = setInterval(() => {
      this.processedRows += Math.floor(Math.random() * 50) + 10;
      this.progressPercentage = Math.min(
        (this.processedRows / this.totalRows) * 100,
        100
      );
      this.updateProcessingMessage();

      if (this.processedRows >= this.totalRows) {
        clearInterval(interval);
        this.completeImport();
      }
    }, 200);
  }

  private updateProcessingMessage() {
    const messages = [
      'Préparation des données...',
      'Validation des champs...',
      'Traitement des enregistrements...',
      'Vérification des doublons...',
      'Enregistrement dans la base de données...',
      'Finalisation de l\'import...'
    ];

    const index = Math.floor((this.progressPercentage / 100) * messages.length);
    this.currentProcessingMessage = messages[Math.min(index, messages.length - 1)];
  }

  private completeImport() {
    this.isProcessing = false;
    this.importResult = {
      total: this.totalRows,
      successCount: this.totalRows - 15,
      errorCount: 5,
      warningCount: 10,
      totalProcessed: this.totalRows,
      success: this.totalRows - 15, // Pour compatibilité avec l'interface
      errors: 5, // Pour compatibilité avec l'interface
      warnings: 10 // Pour compatibilité avec l'interface
    };

    // Add more detailed errors
    this.importErrors = [
      ...this.importErrors,
      {
        row: 45,
        column: 'TELEPHONE',
        message: 'Numéro de téléphone invalide',
        type: 'warning',
      },
      {
        row: 67,
        column: 'Matricule CLIENT',
        message: 'Matricule déjà existant',
        type: 'error',
      },
    ];
  }

  downloadTemplate(template: any) {
    console.log('Téléchargement du template:', template.name);
    // Logique pour télécharger le template
  }

  downloadErrorReport() {
    console.log('Téléchargement du rapport d\'erreurs');
    // Logique pour télécharger le rapport d'erreurs
  }

  downloadReport() {
    // Simulate report download
    const blob = new Blob(["Rapport d'import..."], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rapport-import.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  startNewImport() {
    this.resetImport();
    this.goToStep(1);
  }

  removeFile() {
    this.uploadedFile = null;
    this.previewData = [];
    this.previewHeaders = [];
    this.isFileValid = false;
    this.showPreview = false;
  }

  resetImport() {
    this.uploadedFile = null;
    this.isFileValid = false;
    this.previewData = [];
    this.previewHeaders = [];
    this.importResult = null;
    this.importErrors = [];
    this.processedRows = 0;
    this.totalRows = 0;
    this.progressPercentage = 0;
    this.isProcessing = false;
    this.showPreview = false;

    // Réinitialiser les étapes
    this.importSteps.forEach((step, index) => {
      step.status = index === 0 ? 'active' : 'pending';
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getSuccessRate(): number {
    if (!this.importResult) return 0;
    return Math.round((this.importResult.success || 0) / this.importResult.total * 100);
  }
}
 
