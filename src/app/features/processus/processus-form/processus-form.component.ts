import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  Upload,
  X,
  Eye,
  FileText,
  Calendar,
  User,
  CreditCard,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Hash,
  FileCheck,
  AlertTriangle,
  Info,
  ArrowLeft,
  ArrowRight,
} from 'lucide-angular';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  preview?: string;
  uploaded: boolean;
  error?: string;
}

interface ProcessusStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  active: boolean;
}

interface ValidationRule {
  field: string;
  rules: string[];
  messages: { [key: string]: string };
}

interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'tel'
    | 'number'
    | 'date'
    | 'select'
    | 'textarea'
    | 'file';
  required: boolean;
  options?: { value: any; label: string }[];
  validation?: any;
  placeholder?: string;
  hint?: string;
}

// Validators personnalisés
export function ibanValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const iban = control.value.replace(/\s/g, '');
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/.test(iban)) {
      return { invalidIban: true };
    }
    return null;
  };
}

export function amountValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const amount = parseFloat(control.value);
    if (amount <= 0) {
      return { invalidAmount: true };
    }
    if (amount > 1000000000) {
      return { amountTooLarge: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-processus-form',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './processus-form.component.html',
  styleUrl: './processus-form.component.scss',
})
export class ProcessusFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  processusForm!: FormGroup;
  documents: Document[] = [];
  isSubmitting = false;
  currentStep = 1;
  totalSteps = 4;
  isAutoSaving = false;
  lastSaved?: Date;

  // Form validation
  validationErrors: { [key: string]: string } = {};
  formTouched = false;

  // Configuration
  steps: ProcessusStep[] = [
    {
      id: 1,
      title: 'Informations générales',
      description: 'Détails du processus',
      icon: Info,
      completed: false,
      active: true,
    },
    {
      id: 2,
      title: 'Détails client',
      description: 'Informations client',
      icon: User,
      completed: false,
      active: false,
    },
    {
      id: 3,
      title: 'Informations financières',
      description: 'Montants et comptes',
      icon: DollarSign,
      completed: false,
      active: false,
    },
    {
      id: 4,
      title: 'Documents',
      description: 'Pièces justificatives',
      icon: FileText,
      completed: false,
      active: false,
    },
  ];

  formFields: { [step: number]: FormField[] } = {
    1: [
      {
        name: 'processusType',
        label: 'Type de processus',
        type: 'select',
        required: true,
        options: [
          { value: 'apurement', label: 'Apurement' },
          { value: 'rapatriement', label: 'Rapatriement' },
          { value: 'transfer', label: 'Transfert' },
        ],
      },
      {
        name: 'reference',
        label: 'Référence',
        type: 'text',
        required: true,
        placeholder: 'REF-2024-001',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        placeholder: 'Description du processus...',
      },
      {
        name: 'dateOperation',
        label: "Date d'opération",
        type: 'date',
        required: true,
      },
      {
        name: 'priority',
        label: 'Priorité',
        type: 'select',
        required: true,
        options: [
          { value: 'low', label: 'Basse' },
          { value: 'medium', label: 'Moyenne' },
          { value: 'high', label: 'Haute' },
          { value: 'urgent', label: 'Urgente' },
        ],
      },
    ],
    2: [
      {
        name: 'clientType',
        label: 'Type de client',
        type: 'select',
        required: true,
        options: [
          { value: 'individual', label: 'Particulier' },
          { value: 'company', label: 'Entreprise' },
          { value: 'institution', label: 'Institution' },
        ],
      },
      {
        name: 'clientName',
        label: 'Nom du client',
        type: 'text',
        required: true,
        placeholder: 'Nom complet ou raison sociale',
      },
      {
        name: 'clientId',
        label: "Numéro d'identification",
        type: 'text',
        required: true,
        placeholder: 'CNI, Passeport, RCCM...',
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'client@email.com',
      },
      {
        name: 'phone',
        label: 'Téléphone',
        type: 'tel',
        required: true,
        placeholder: '+237 6XX XXX XXX',
      },
      {
        name: 'address',
        label: 'Adresse',
        type: 'textarea',
        required: true,
        placeholder: 'Adresse complète',
      },
    ],
    3: [
      {
        name: 'amount',
        label: 'Montant',
        type: 'number',
        required: true,
        placeholder: '0.00',
        validation: [amountValidator()],
      },
      {
        name: 'currency',
        label: 'Devise',
        type: 'select',
        required: true,
        options: [
          { value: 'XAF', label: 'XAF (Franc CFA)' },
          { value: 'EUR', label: 'EUR (Euro)' },
          { value: 'USD', label: 'USD (Dollar)' },
        ],
      },
      {
        name: 'accountNumber',
        label: 'Numéro de compte',
        type: 'text',
        required: true,
        placeholder: 'Numéro de compte',
      },
      {
        name: 'iban',
        label: 'IBAN',
        type: 'text',
        required: false,
        placeholder: 'FR14 2004 1010 0505 0001 3M02 606',
        validation: [ibanValidator()],
      },
      {
        name: 'bankName',
        label: 'Banque bénéficiaire',
        type: 'text',
        required: true,
        placeholder: 'Nom de la banque',
      },
      {
        name: 'swiftCode',
        label: 'Code SWIFT/BIC',
        type: 'text',
        required: false,
        placeholder: 'BKAUAUC1XXX',
      },
    ],
  };

  // Icons
  Upload = Upload;
  X = X;
  Eye = Eye;
  FileText = FileText;
  Calendar = Calendar;
  User = User;
  CreditCard = CreditCard;
  Save = Save;
  Send = Send;
  AlertCircle = AlertCircle;
  CheckCircle = CheckCircle;
  Clock = Clock;
  Building = Building;
  MapPin = MapPin;
  Phone = Phone;
  Mail = Mail;
  DollarSign = DollarSign;
  Hash = Hash;
  FileCheck = FileCheck;
  AlertTriangle = AlertTriangle;
  Info = Info;
  ArrowLeft = ArrowLeft;
  ArrowRight = ArrowRight;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.initForm();
    this.setupAutoSave();
    this.setupValidation();
    this.loadDraftData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    const formConfig: any = {};

    // Étape 1: Informations générales
    formConfig.processusType = ['', [Validators.required]];
    formConfig.reference = ['', [Validators.required, Validators.minLength(5)]];
    formConfig.description = [
      '',
      [Validators.required, Validators.minLength(10)],
    ];
    formConfig.dateOperation = ['', [Validators.required]];
    formConfig.priority = ['medium', [Validators.required]];

    // Étape 2: Détails client
    formConfig.clientType = ['', [Validators.required]];
    formConfig.clientName = [
      '',
      [Validators.required, Validators.minLength(2)],
    ];
    formConfig.clientId = ['', [Validators.required]];
    formConfig.email = ['', [Validators.required, Validators.email]];
    formConfig.phone = [
      '',
      [Validators.required, Validators.pattern(/^\+?[0-9\s\-\(\)]{8,15}$/)],
    ];
    formConfig.address = ['', [Validators.required, Validators.minLength(10)]];

    // Étape 3: Informations financières
    formConfig.amount = ['', [Validators.required, amountValidator()]];
    formConfig.currency = ['XAF', [Validators.required]];
    formConfig.accountNumber = ['', [Validators.required]];
    formConfig.iban = ['', [ibanValidator()]];
    formConfig.bankName = ['', [Validators.required]];
    formConfig.swiftCode = [''];

    this.processusForm = this.fb.group(formConfig);
  }

  private setupAutoSave() {
    this.processusForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(2000),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.autoSave();
      });
  }

  private setupValidation() {
    this.processusForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateValidationErrors();
      });
  }

  private updateValidationErrors() {
    this.validationErrors = {};
    Object.keys(this.processusForm.controls).forEach((key) => {
      const control = this.processusForm.get(key);
      if (control && control.invalid && (control.dirty || control.touched)) {
        this.validationErrors[key] = this.getErrorMessage(key, control.errors);
      }
    });
  }

  private getErrorMessage(fieldName: string, errors: any): string {
    if (errors['required']) return `${fieldName} est requis`;
    if (errors['email']) return 'Format email invalide';
    if (errors['minlength'])
      return `Minimum ${errors['minlength'].requiredLength} caractères`;
    if (errors['pattern']) return 'Format invalide';
    if (errors['invalidIban']) return 'Format IBAN invalide';
    if (errors['invalidAmount']) return 'Montant invalide';
    if (errors['amountTooLarge']) return 'Montant trop élevé';
    return 'Erreur de validation';
  }

  private autoSave() {
    if (this.processusForm.valid && !this.isAutoSaving) {
      this.isAutoSaving = true;
      // Simulation de sauvegarde
      setTimeout(() => {
        this.lastSaved = new Date();
        this.isAutoSaving = false;
      }, 1000);
    }
  }

  private loadDraftData() {
    // Charger les données brouillon depuis localStorage
    const draft = localStorage.getItem('processus-form-draft');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        this.processusForm.patchValue(data);
      } catch (error) {
        console.error('Erreur lors du chargement du brouillon:', error);
      }
    }
  }

  public saveDraft() {
    if (this.processusForm.dirty) {
      localStorage.setItem(
        'processus-form-draft',
        JSON.stringify(this.processusForm.value)
      );
    }
  }

  // Navigation entre étapes
  canGoToNextStep(): boolean {
    const currentStepFields = this.formFields[this.currentStep] || [];
    return currentStepFields.every((field) => {
      const control = this.processusForm.get(field.name);
      return !field.required || (control && control.valid);
    });
  }

  nextStep() {
    if (this.currentStep < this.totalSteps && this.canGoToNextStep()) {
      this.markStepAsCompleted(this.currentStep);
      this.currentStep++;
      this.updateStepState();
      this.saveDraft();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepState();
    }
  }

  goToStep(step: number) {
    if (step <= this.currentStep || this.canGoToNextStep()) {
      this.currentStep = step;
      this.updateStepState();
    }
  }

  private markStepAsCompleted(step: number) {
    const stepIndex = this.steps.findIndex((s) => s.id === step);
    if (stepIndex !== -1) {
      this.steps[stepIndex].completed = true;
    }
  }

  private updateStepState() {
    this.steps.forEach((step) => {
      step.active = step.id === this.currentStep;
    });
  }

  getCurrentStepFields(): FormField[] {
    return this.formFields[this.currentStep] || [];
  }

  getFieldError(fieldName: string): string | null {
    return this.validationErrors[fieldName] || null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.processusForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]) {
    files.forEach((file) => {
      if (this.validateFile(file)) {
        const document: Document = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
          uploaded: false,
        };

        // Generate preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            document.preview = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }

        this.documents.push(document);
        this.uploadDocument(document);
      }
    });
  }

  private uploadDocument(document: Document) {
    // Simulation d'upload
    setTimeout(() => {
      document.uploaded = true;
    }, 1500);
  }

  private validateFile(file: File): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (file.size > maxSize) {
      alert(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      alert(`Le type de fichier ${file.name} n'est pas autorisé`);
      return false;
    }

    return true;
  }

  removeDocument(documentId: string) {
    this.documents = this.documents.filter((doc) => doc.id !== documentId);
  }

  previewDocument(document: Document) {
    if (document.preview) {
      // Open image preview in modal
      window.open(document.preview, '_blank');
    } else {
      // For other file types, you might want to implement a different preview mechanism
      alert('Aperçu non disponible pour ce type de fichier');
    }
  }

  trackByDocument(index: number, document: Document): string {
    return document.id;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  saveFormDraft() {
    // Save form data as draft
    const formData = this.processusForm.value;
    localStorage.setItem('processus_draft', JSON.stringify(formData));
    alert('Brouillon sauvegardé avec succès');
  }

  onSubmit() {
    this.formTouched = true;
    this.processusForm.markAllAsTouched();

    if (this.processusForm.valid && this.documents.length > 0) {
      this.isSubmitting = true;

      const formData = {
        ...this.processusForm.value,
        documents: this.documents.map((doc) => ({
          id: doc.id,
          name: doc.name,
          size: doc.size,
          type: doc.type,
        })),
      };

      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        localStorage.removeItem('processus-form-draft');
        alert('Processus soumis avec succès!');
        this.router.navigate(['/processus']);
      }, 2000);
    } else {
      // Afficher les erreurs de validation
      this.updateValidationErrors();
      alert('Veuillez corriger les erreurs dans le formulaire');
    }
  }

  goBack() {
    if (this.processusForm.dirty) {
      if (
        confirm(
          'Vous avez des modifications non sauvegardées. Voulez-vous les sauvegarder comme brouillon ?'
        )
      ) {
        this.saveDraft();
      }
    }
    this.router.navigate(['/processus']);
  }

  // Méthodes utilitaires pour le template
  getStepProgress(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  getCompletedStepsCount(): number {
    return this.steps.filter((step) => step.completed).length;
  }

  isStepValid(stepNumber: number): boolean {
    const stepFields = this.formFields[stepNumber] || [];
    return stepFields.every((field) => {
      const control = this.processusForm.get(field.name);
      return !field.required || (control && control.valid);
    });
  }

  getStepIcon(step: ProcessusStep): any {
    if (step.completed) return CheckCircle;
    if (step.active) return step.icon;
    return step.icon;
  }

  formatCurrency(amount: number, currency: string = 'XAF'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
}
