import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import {
  Settings,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Save,
  Test,
  Eye,
  Edit,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Sliders,
  Toggle
} from 'lucide-angular';
import { NotificationConfigService, NotificationConfig, NotificationTemplate } from '../../../core/services/notification-config.service';
import { Canal } from '../../../core/services/api.service';

@Component({
  selector: 'app-notification-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './notification-config.component.html',
  styleUrls: ['./notification-config.component.scss']
})
export class NotificationConfigComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Icons
  readonly Settings = Settings;
  readonly Bell = Bell;
  readonly Mail = Mail;
  readonly MessageSquare = MessageSquare;
  readonly Smartphone = Smartphone;
  readonly Save = Save;
  readonly Test = Test;
  readonly Eye = Eye;
  readonly Edit = Edit;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;
  readonly Clock = Clock;
  readonly Calendar = Calendar;
  readonly Sliders = Sliders;
  readonly Toggle = Toggle;

  // État de l'interface
  activeTab: 'config' | 'canaux' | 'templates' = 'config';
  isLoading = false;
  isSaving = false;
  showPreview = false;
  selectedConfig: NotificationConfig | null = null;
  selectedTemplate: NotificationTemplate | null = null;

  // Données
  configurations: NotificationConfig[] = [];
  canaux: Canal[] = [];
  templates: NotificationTemplate[] = [];
  testResults: { [key: number]: boolean | null } = {};

  // Formulaires
  configForm!: FormGroup;
  canalForm!: FormGroup;
  templateForm!: FormGroup;

  // Variables pour la prévisualisation
  previewVariables = {
    nomClient: 'Jean DUPONT',
    montant: '500,000',
    devise: 'XAF',
    dateTransaction: '15/01/2024',
    numeroCartePartiel: '****1234',
    joursRestants: '7'
  };

  constructor(
    private fb: FormBuilder,
    private notificationConfigService: NotificationConfigService
  ) {
    this.initForms();
  }

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms() {
    this.configForm = this.fb.group({
      id: [''],
      type: ['', Validators.required],
      delaiJours: [0, [Validators.required, Validators.min(0)]],
      canaux: [[], Validators.required],
      actif: [true],
      modele: ['', Validators.required],
      frequenceRappel: [0],
      libelle: ['', Validators.required],
      description: ['']
    });

    this.canalForm = this.fb.group({
      id: [''],
      nom: ['', Validators.required],
      type: ['EMAIL', Validators.required],
      actif: [true],
      configuration: this.fb.group({
        serveur: [''],
        port: [''],
        utilisateur: [''],
        motDePasse: [''],
        apiKey: [''],
        webhook: ['']
      })
    });

    this.templateForm = this.fb.group({
      id: [''],
      nom: ['', Validators.required],
      sujet: ['', Validators.required],
      contenu: ['', Validators.required],
      type: ['EMAIL', Validators.required],
      variables: [[]]
    });
  }

  private loadData() {
    this.isLoading = true;

    this.notificationConfigService.getConfigurations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(configs => {
        this.configurations = configs;
        this.isLoading = false;
      });

    this.notificationConfigService.canaux$
      .pipe(takeUntil(this.destroy$))
      .subscribe(canaux => {
        this.canaux = canaux;
      });

    this.notificationConfigService.getTemplates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(templates => {
        this.templates = templates;
      });
  }

  // Gestion des onglets
  setActiveTab(tab: 'config' | 'canaux' | 'templates') {
    this.activeTab = tab;
    this.selectedConfig = null;
    this.selectedTemplate = null;
    this.resetForms();
  }

  // Gestion des configurations
  editConfig(config: NotificationConfig) {
    this.selectedConfig = config;
    this.configForm.patchValue(config);
  }

  saveConfig() {
    if (this.configForm.valid) {
      this.isSaving = true;
      const configData = this.configForm.value;

      this.notificationConfigService.updateConfiguration(configData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (savedConfig) => {
            this.isSaving = false;
            this.selectedConfig = null;
            this.resetForms();
            // Afficher un message de succès
          },
          error: (error) => {
            this.isSaving = false;
            console.error('Erreur lors de la sauvegarde:', error);
          }
        });
    }
  }

  deleteConfig(config: NotificationConfig) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la configuration "${config.libelle}" ?`)) {
      // Implémentation de la suppression
      this.configurations = this.configurations.filter(c => c.id !== config.id);
    }
  }

  // Gestion des canaux
  editCanal(canal: Canal) {
    this.canalForm.patchValue(canal);
  }

  saveCanal() {
    if (this.canalForm.valid) {
      this.isSaving = true;
      const canalData = this.canalForm.value;

      const saveObservable = canalData.id 
        ? this.notificationConfigService.updateCanal(canalData)
        : this.notificationConfigService.createCanal(canalData);

      saveObservable
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (savedCanal) => {
            this.isSaving = false;
            this.resetForms();
            this.loadData();
          },
          error: (error) => {
            this.isSaving = false;
            console.error('Erreur lors de la sauvegarde du canal:', error);
          }
        });
    }
  }

  testCanal(canal: Canal) {
    if (canal.id) {
      this.testResults[canal.id] = null; // État de chargement
      
      this.notificationConfigService.testCanal(canal.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            this.testResults[canal.id!] = success;
          },
          error: (error) => {
            this.testResults[canal.id!] = false;
            console.error('Erreur lors du test du canal:', error);
          }
        });
    }
  }

  // Gestion des templates
  editTemplate(template: NotificationTemplate) {
    this.selectedTemplate = template;
    this.templateForm.patchValue(template);
  }

  saveTemplate() {
    if (this.templateForm.valid) {
      this.isSaving = true;
      const templateData = this.templateForm.value;

      this.notificationConfigService.saveTemplate(templateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (savedTemplate) => {
            this.isSaving = false;
            this.selectedTemplate = null;
            this.resetForms();
          },
          error: (error) => {
            this.isSaving = false;
            console.error('Erreur lors de la sauvegarde du template:', error);
          }
        });
    }
  }

  previewTemplate(template: NotificationTemplate) {
    return this.notificationConfigService.previewTemplate(template, this.previewVariables);
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
  }

  // Méthodes utilitaires
  private resetForms() {
    this.configForm.reset();
    this.canalForm.reset();
    this.templateForm.reset();
  }

  getConfigTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'INITIAL': 'Notification initiale',
      'RELANCE': 'Première relance',
      'MISE_EN_DEMEURE': 'Mise en demeure',
      'SUSPENSION': 'Suspension'
    };
    return labels[type] || type;
  }

  getCanalIcon(type: string) {
    switch (type) {
      case 'EMAIL': return this.Mail;
      case 'SMS': return this.Smartphone;
      case 'WHATSAPP': return this.MessageSquare;
      default: return this.Bell;
    }
  }

  getStatusIcon(status: boolean | null) {
    if (status === null) return this.Clock;
    return status ? this.CheckCircle : this.AlertCircle;
  }

  getStatusClass(status: boolean | null): string {
    if (status === null) return 'text-yellow-500';
    return status ? 'text-green-500' : 'text-red-500';
  }

  onDelaiChange(config: NotificationConfig, newValue: number) {
    config.delaiJours = newValue;
    // Auto-save ou marquer comme modifié
  }

  toggleCanal(config: NotificationConfig, canal: string) {
    const index = config.canaux.indexOf(canal as any);
    if (index > -1) {
      config.canaux.splice(index, 1);
    } else {
      config.canaux.push(canal as any);
    }
  }

  isCanalSelected(config: NotificationConfig, canal: string): boolean {
    return config.canaux.includes(canal as any);
  }
}