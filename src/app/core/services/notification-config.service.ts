import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService, Canal, RepartitionEnvoi } from './api.service';

export interface NotificationConfig {
  id?: string;
  type: 'INITIAL' | 'RELANCE' | 'MISE_EN_DEMEURE' | 'SUSPENSION';
  delaiJours: number;
  canaux: ('EMAIL' | 'SMS' | 'WHATSAPP')[];
  actif: boolean;
  modele: string;
  frequenceRappel?: number;
  libelle: string;
  description: string;
}

export interface NotificationTemplate {
  id?: string;
  nom: string;
  sujet: string;
  contenu: string;
  variables: string[];
  type: 'EMAIL' | 'SMS' | 'WHATSAPP';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationConfigService {
  private configSubject = new BehaviorSubject<NotificationConfig[]>([]);
  public config$ = this.configSubject.asObservable();

  private templatesSubject = new BehaviorSubject<NotificationTemplate[]>([]);
  public templates$ = this.templatesSubject.asObservable();

  private canauxSubject = new BehaviorSubject<Canal[]>([]);
  public canaux$ = this.canauxSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadInitialData();
  }

  private loadInitialData() {
    // Configuration par défaut basée sur les spécifications
    const defaultConfigs: NotificationConfig[] = [
      {
        id: '1',
        type: 'INITIAL',
        delaiJours: 0,
        canaux: ['EMAIL', 'SMS'],
        actif: true,
        modele: 'notification_initiale',
        libelle: 'Notification initiale',
        description: 'Notification immédiate après détection de transaction'
      },
      {
        id: '2',
        type: 'RELANCE',
        delaiJours: 21,
        canaux: ['EMAIL', 'SMS', 'WHATSAPP'],
        actif: true,
        modele: 'premiere_relance',
        frequenceRappel: 7,
        libelle: 'Première relance',
        description: '21 jours après la transaction'
      },
      {
        id: '3',
        type: 'MISE_EN_DEMEURE',
        delaiJours: 30,
        canaux: ['EMAIL', 'SMS', 'WHATSAPP'],
        actif: true,
        modele: 'mise_en_demeure',
        libelle: 'Mise en demeure',
        description: '30 jours après la transaction'
      },
      {
        id: '4',
        type: 'SUSPENSION',
        delaiJours: 38,
        canaux: ['EMAIL', 'SMS'],
        actif: true,
        modele: 'suspension',
        libelle: 'Suspension',
        description: '8 jours après mise en demeure'
      }
    ];

    this.configSubject.next(defaultConfigs);
    this.loadCanaux();
    this.loadTemplates();
  }

  private loadCanaux() {
    this.apiService.getAllCanaux().subscribe({
      next: (canaux) => {
        this.canauxSubject.next(canaux);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des canaux:', error);
        // Canaux par défaut en cas d'erreur
        const defaultCanaux: Canal[] = [
          { id: 1, nom: 'Email', type: 'EMAIL', actif: true, configuration: {} },
          { id: 2, nom: 'SMS', type: 'SMS', actif: true, configuration: {} },
          { id: 3, nom: 'WhatsApp', type: 'WHATSAPP', actif: true, configuration: {} }
        ];
        this.canauxSubject.next(defaultCanaux);
      }
    });
  }

  private loadTemplates() {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: '1',
        nom: 'Notification initiale',
        sujet: 'Justification requise - Transaction hors CEMAC',
        contenu: `Cher(e) {{nomClient}},

Nous avons détecté une transaction de {{montant}} {{devise}} effectuée le {{dateTransaction}} avec votre carte se terminant par {{numeroCartePartiel}}.

Conformément à la réglementation CEMAC, vous devez fournir les justificatifs de cette transaction dans les plus brefs délais.

Cordialement,
Afriland First Bank`,
        variables: ['nomClient', 'montant', 'devise', 'dateTransaction', 'numeroCartePartiel'],
        type: 'EMAIL'
      },
      {
        id: '2',
        nom: 'Première relance',
        sujet: 'RAPPEL - Justification requise - Transaction hors CEMAC',
        contenu: `Cher(e) {{nomClient}},

Nous vous rappelons que vous devez fournir les justificatifs pour votre transaction de {{montant}} {{devise}} effectuée le {{dateTransaction}}.

Délai restant: {{joursRestants}} jours.

Cordialement,
Afriland First Bank`,
        variables: ['nomClient', 'montant', 'devise', 'dateTransaction', 'joursRestants'],
        type: 'EMAIL'
      }
    ];

    this.templatesSubject.next(defaultTemplates);
  }

  // Méthodes publiques
  getConfigurations(): Observable<NotificationConfig[]> {
    return this.config$;
  }

  updateConfiguration(config: NotificationConfig): Observable<NotificationConfig> {
    const currentConfigs = this.configSubject.value;
    const index = currentConfigs.findIndex(c => c.id === config.id);
    
    if (index !== -1) {
      currentConfigs[index] = config;
    } else {
      config.id = Date.now().toString();
      currentConfigs.push(config);
    }
    
    this.configSubject.next([...currentConfigs]);
    
    // Ici, vous pourriez appeler l'API pour sauvegarder
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(config);
        observer.complete();
      }, 500);
    });
  }

  createCanal(canal: Canal): Observable<Canal> {
    return this.apiService.createCanal(canal);
  }

  updateCanal(canal: Canal): Observable<Canal> {
    if (canal.id) {
      return this.apiService.updateCanal(canal, canal.id);
    }
    throw new Error('Canal ID is required for update');
  }

  testCanal(canalId: number): Observable<boolean> {
    // Simulation du test de connectivité
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(Math.random() > 0.2); // 80% de succès
        observer.complete();
      }, 2000);
    });
  }

  getTemplates(): Observable<NotificationTemplate[]> {
    return this.templates$;
  }

  saveTemplate(template: NotificationTemplate): Observable<NotificationTemplate> {
    const currentTemplates = this.templatesSubject.value;
    const index = currentTemplates.findIndex(t => t.id === template.id);
    
    if (index !== -1) {
      currentTemplates[index] = template;
    } else {
      template.id = Date.now().toString();
      currentTemplates.push(template);
    }
    
    this.templatesSubject.next([...currentTemplates]);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(template);
        observer.complete();
      }, 500);
    });
  }

  previewTemplate(template: NotificationTemplate, variables: any): string {
    let content = template.contenu;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, variables[key]);
    });
    return content;
  }
}