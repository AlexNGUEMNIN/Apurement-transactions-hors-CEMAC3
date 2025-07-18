import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: Date;
}

export interface ProcessusApurement {
  id?: string;
  numeroTransaction: string;
  numeroCartePartiel: string;
  nomClient: string;
  prenomClient: string;
  email: string;
  telephone: string;
  montant: number;
  devise: string;
  dateTransaction: Date;
  statut: 'EN_ATTENTE' | 'SOUMIS' | 'A_MODIFIER' | 'REJETE' | 'JUSTIFIE' | 'CLOTURE';
  justificatifs: Justificatif[];
  commentaires: Commentaire[];
  echeanceJ21: Date;
  echeanceJ30: Date;
  echeanceJ38: Date;
  reseau: string;
  agence: string;
  matriculeClient: string;
  moisVoyage: number;
  anneeVoyage: string;
}

export interface Justificatif {
  id?: string;
  nom: string;
  type: string;
  taille: number;
  url?: string;
  dateUpload: Date;
}

export interface Commentaire {
  id?: string;
  contenu: string;
  auteur: string;
  dateCreation: Date;
  type: 'INTERNE' | 'CLIENT';
}

export interface Canal {
  id?: number;
  nom: string;
  type: 'EMAIL' | 'SMS' | 'WHATSAPP';
  actif: boolean;
  configuration: any;
}

export interface ListeOperations {
  id?: number;
  nom: string;
  description: string;
  dateCreation: Date;
  actif: boolean;
}

export interface RepartitionEnvoi {
  id?: number;
  canalId: number;
  operationId: number;
  delaiJours: number;
  actif: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl || 'http://localhost:8088';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  private setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  // Document Controller Integration
  telechargerDocument(): Observable<string> {
    this.setLoading(true);
    return this.http.get<string>(`${this.baseUrl}/apure_comex/telecharger`)
      .pipe(
        finalize(() => this.setLoading(false))
      );
  }

  readFileParallele(chunkSize: number = 10): Observable<Map<string, Object>> {
    const params = new HttpParams().set('chunkSize', chunkSize.toString());
    return this.http.get<Map<string, Object>>(`${this.baseUrl}/apure_comex/readFileParallele`, { params });
  }

  readFile(chunkSize: number = 10): Observable<Map<string, Object>> {
    const params = new HttpParams().set('chunkSize', chunkSize.toString());
    return this.http.get<Map<string, Object>>(`${this.baseUrl}/apure_comex/readFile`, { params });
  }

  streamExcelData(): Observable<Map<string, string>> {
    return this.http.get<Map<string, string>>(`${this.baseUrl}/apure_comex/readFile2`);
  }

  // Canal Controller Integration
  createCanal(canal: Canal): Observable<Canal> {
    this.setLoading(true);
    return this.http.post<Canal>(`${this.baseUrl}/canal/save`, canal)
      .pipe(
        finalize(() => this.setLoading(false))
      );
  }

  getCanalById(id: number): Observable<Canal> {
    return this.http.get<Canal>(`${this.baseUrl}/canal/${id}`);
  }

  getAllCanaux(): Observable<Canal[]> {
    return this.http.get<Canal[]>(`${this.baseUrl}/canal`);
  }

  updateCanal(canal: Canal, id: number): Observable<Canal> {
    this.setLoading(true);
    return this.http.put<Canal>(`${this.baseUrl}/canal/${id}`, canal)
      .pipe(
        finalize(() => this.setLoading(false))
      );
  }

  // Client Controller Integration
  sendEmailToClients(): Observable<number> {
    this.setLoading(true);
    return this.http.get<number>(`${this.baseUrl}/client/sendEmail`)
      .pipe(
        finalize(() => this.setLoading(false))
      );
  }

  // Liste Operations Controller Integration
  saveListeOperations(listeOperations: ListeOperations): Observable<ListeOperations> {
    this.setLoading(true);
    return this.http.post<ListeOperations>(`${this.baseUrl}/operation`, listeOperations)
      .pipe(
        finalize(() => this.setLoading(false))
      );
  }

  updateListeOperations(id: number, listeOperations: ListeOperations): Observable<ListeOperations> {
    this.setLoading(true);
    return this.http.put<ListeOperations>(`${this.baseUrl}/operation/update/${id}`, listeOperations)
      .pipe(
        finalize(() => this.setLoading(false))
      );
  }

  deleteListeOperations(id: number): Observable<any> {
    this.setLoading(true);
    return this.http.delete(`${this.baseUrl}/operation/${id}`)
      .pipe(
        finalize(() => this.setLoading(false))
      );
  }

  // Repartition Envoi Controller Integration
  saveRepartitionEnvoi(repartitionEnvoi: RepartitionEnvoi): Observable<RepartitionEnvoi> {
    this.setLoading(true);
    return this.http.post<RepartitionEnvoi>(`${this.baseUrl}/repartition`, repartitionEnvoi)
      .pipe(
        finalize(() => this.setLoading(false))
      );
  }

  // Méthodes utilitaires pour les processus
  getProcessus(filters?: any): Observable<ProcessusApurement[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<ProcessusApurement[]>(`${this.baseUrl}/processus`, { params });
  }

  getProcessusById(id: string): Observable<ProcessusApurement> {
    return this.http.get<ProcessusApurement>(`${this.baseUrl}/processus/${id}`);
  }

  createProcessus(processus: ProcessusApurement): Observable<ProcessusApurement> {
    this.setLoading(true);
    return this.http.post<ProcessusApurement>(`${this.baseUrl}/processus`, processus)
      .pipe(
        finalize(() => this.setLoading(false))
      );
  }

  updateProcessus(id: string, processus: ProcessusApurement): Observable<ProcessusApurement> {
    this.setLoading(true);
    return this.http.put<ProcessusApurement>(`${this.baseUrl}/processus/${id}`, processus)
      .pipe(
        finalize(() => this.setLoading(false))
      );
  }

  uploadJustificatifs(processusId: string, files: File[]): Observable<Justificatif[]> {
    this.setLoading(true);
    const formData = new FormData();
    formData.append('processusId', processusId);
    files.forEach(file => formData.append('justificatifs', file));
    
    return this.http.post<Justificatif[]>(`${this.baseUrl}/processus/justificatifs`, formData)
      .pipe(
        finalize(() => this.setLoading(false))
      );
  }

  // Statistiques et dashboard
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/stats`);
  }

  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/notifications`);
  }
}