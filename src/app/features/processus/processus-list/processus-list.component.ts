import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  BehaviorSubject,
} from 'rxjs';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  Upload,
  SortAsc,
  SortDesc,
  Calendar,
  Users,
  MoreVertical,
  RefreshCw,
  TrendingUp,
  FileText,
  AlertCircle,
} from 'lucide-angular';

interface Processus {
  id: string;
  numeroProcessus: string;
  matricule: string;
  nomClient: string;
  dateSubmission: Date;
  statut:
    | 'EN_ATTENTE'
    | 'ASSIGNE'
    | 'A_MODIFIER'
    | 'REJETE'
    | 'JUSTIFIE'
    | 'CLOTURE';
  priorite: 'HAUTE' | 'NORMALE' | 'BASSE';
  agence: string;
  montant: number;
  assigneA?: string;
  documentsCount?: number;
  progression?: number;
  dateEcheance?: Date;
  commentaires?: string;
  typeTransaction?: string;
  devise?: string;
}

interface FilterOptions {
  statut: string;
  priorite: string;
  agence: string;
  dateDebut?: Date;
  dateFin?: Date;
}

interface SortOptions {
  field: keyof Processus;
  direction: 'asc' | 'desc';
}

interface Stats {
  total: number;
  enAttente: number;
  assignes: number;
  justifies: number;
  rejetes: number;
  delaiMoyen: number;
}
@Component({
  selector: 'app-processus-list',
  standalone: true, // Assurez-vous que cette propriété est définie
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  templateUrl: './processus-list.component.html',
  styleUrl: './processus-list.component.scss',
})
export class ProcessusListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private processusList$ = new BehaviorSubject<Processus[]>([]);
  // Icons
  Plus = Plus;
  Search = Search;
  Filter = Filter;
  Eye = Eye;
  Edit = Edit;
  Trash2 = Trash2;
  Clock = Clock;
  CheckCircle = CheckCircle;
  AlertTriangle = AlertTriangle;
  XCircle = XCircle;
  Download = Download;
  Upload = Upload;
  SortAsc = SortAsc;
  SortDesc = SortDesc;
  Calendar = Calendar;
  Users = Users;
  MoreVertical = MoreVertical;
  RefreshCw = RefreshCw;
  TrendingUp = TrendingUp;
  FileText = FileText;
  AlertCircle = AlertCircle;

  // États de chargement et UI
  isLoading = true;
  isRefreshing = false;
  showFilters = false;
  showBulkActions = false;
  viewMode: 'table' | 'card' = 'table';

  // Données
  allProcessus: Processus[] = [];
  filteredProcessus: Processus[] = [];
  selectedProcessus: Set<string> = new Set();
  stats: Stats = {
    total: 0,
    enAttente: 0,
    assignes: 0,
    justifies: 0,
    rejetes: 0,
    delaiMoyen: 0,
  };

  // Filtres et recherche
  searchTerm = '';
  filters: FilterOptions = {
    statut: '',
    priorite: '',
    agence: '',
    dateDebut: undefined,
    dateFin: undefined,
  };

  // Tri et pagination
  sortOptions: SortOptions = {
    field: 'dateSubmission',
    direction: 'desc',
  };

  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // Options pour les filtres
  statusOptions = [
    { value: 'EN_ATTENTE', label: 'En attente', count: 0 },
    { value: 'ASSIGNE', label: 'Assigné', count: 0 },
    { value: 'A_MODIFIER', label: 'À modifier', count: 0 },
    { value: 'REJETE', label: 'Rejeté', count: 0 },
    { value: 'JUSTIFIE', label: 'Justifié', count: 0 },
    { value: 'CLOTURE', label: 'Clôturé', count: 0 },
  ];

  priorityOptions = [
    { value: 'HAUTE', label: 'Haute' },
    { value: 'NORMALE', label: 'Normale' },
    { value: 'BASSE', label: 'Basse' },
  ];

  agenceOptions = [
    'Douala',
    'Yaoundé',
    'Bafoussam',
    'Garoua',
    'Ngaoundéré',
    'Bertoua',
    'Maroua',
    'Bamenda',
  ];

  // Ajouter ces propriétés manquantes
  selectedStatus = '';
  selectedPriority = '';
  selectedAgency = '';

  ngOnInit() {
    this.setupSearchSubscription();
    this.loadProcessusData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchSubscription() {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.searchTerm = searchTerm;
        this.applyFiltersAndSort();
      });
  }

  private loadProcessusData() {
    this.isLoading = true;

    // Simulation de chargement des données avec délai
    setTimeout(() => {
      this.allProcessus = this.generateMockData();
      this.calculateStats();
      this.updateStatusCounts();
      this.applyFiltersAndSort();
      this.isLoading = false;
    }, 1500);
  }

  private generateMockData(): Processus[] {
    const statuts: Processus['statut'][] = [
      'EN_ATTENTE',
      'ASSIGNE',
      'A_MODIFIER',
      'REJETE',
      'JUSTIFIE',
      'CLOTURE',
    ];
    const priorites: Processus['priorite'][] = ['HAUTE', 'NORMALE', 'BASSE'];
    const agences = this.agenceOptions;
    const devises = ['XAF', 'EUR', 'USD'];
    const types = ['Virement', 'Transfert', 'Change', 'Crédit', 'Débit'];

    const processus: Processus[] = [];

    for (let i = 1; i <= 45; i++) {
      const dateSubmission = new Date(
        2024,
        0,
        Math.floor(Math.random() * 30) + 1
      );
      const dateEcheance = new Date(
        dateSubmission.getTime() +
          (Math.random() * 14 + 1) * 24 * 60 * 60 * 1000
      );

      processus.push({
        id: i.toString(),
        numeroProcessus: `APR-2024-${i.toString().padStart(3, '0')}`,
        matricule: `EMP${i.toString().padStart(3, '0')}`,
        nomClient: `Client ${i}`,
        dateSubmission,
        dateEcheance,
        statut: statuts[Math.floor(Math.random() * statuts.length)],
        priorite: priorites[Math.floor(Math.random() * priorites.length)],
        agence: agences[Math.floor(Math.random() * agences.length)],
        montant: Math.floor(Math.random() * 5000000) + 500000,
        assigneA:
          Math.random() > 0.5
            ? `Agent ${Math.floor(Math.random() * 10) + 1}`
            : undefined,
        documentsCount: Math.floor(Math.random() * 8) + 1,
        progression: Math.floor(Math.random() * 101),
        typeTransaction: types[Math.floor(Math.random() * types.length)],
        devise: devises[Math.floor(Math.random() * devises.length)],
        commentaires:
          Math.random() > 0.7
            ? `Commentaire pour le processus ${i}`
            : undefined,
      });
    }

    return processus;
  }

  private calculateStats() {
    this.stats = {
      total: this.allProcessus.length,
      enAttente: this.allProcessus.filter((p) => p.statut === 'EN_ATTENTE')
        .length,
      assignes: this.allProcessus.filter((p) => p.statut === 'ASSIGNE').length,
      justifies: this.allProcessus.filter((p) => p.statut === 'JUSTIFIE')
        .length,
      rejetes: this.allProcessus.filter((p) => p.statut === 'REJETE').length,
      delaiMoyen: 4.2, // Calcul simulé
    };
  }

  private updateStatusCounts() {
    this.statusOptions.forEach((option) => {
      option.count = this.allProcessus.filter(
        (p) => p.statut === option.value
      ).length;
    });
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  applyFiltersAndSort() {
    let filtered = [...this.allProcessus];

    // Recherche textuelle
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.numeroProcessus.toLowerCase().includes(searchLower) ||
          p.nomClient.toLowerCase().includes(searchLower) ||
          p.matricule.toLowerCase().includes(searchLower) ||
          p.agence.toLowerCase().includes(searchLower)
      );
    }

    // Filtres
    if (this.filters.statut) {
      filtered = filtered.filter((p) => p.statut === this.filters.statut);
    }
    if (this.filters.priorite) {
      filtered = filtered.filter((p) => p.priorite === this.filters.priorite);
    }
    if (this.filters.agence) {
      filtered = filtered.filter((p) => p.agence === this.filters.agence);
    }
    if (this.filters.dateDebut) {
      filtered = filtered.filter(
        (p) => p.dateSubmission >= this.filters.dateDebut!
      );
    }
    if (this.filters.dateFin) {
      filtered = filtered.filter(
        (p) => p.dateSubmission <= this.filters.dateFin!
      );
    }

    // Tri
    filtered.sort((a, b) => {
      const aVal = a[this.sortOptions.field];
      const bVal = b[this.sortOptions.field];

      let comparison = 0;
      if (aVal !== undefined && bVal !== undefined) {
        if (aVal < bVal) comparison = -1;
        if (aVal > bVal) comparison = 1;
      }

      return this.sortOptions.direction === 'desc' ? -comparison : comparison;
    });

    this.filteredProcessus = filtered;
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  toggleSort(field: keyof Processus) {
    if (this.sortOptions.field === field) {
      this.sortOptions.direction =
        this.sortOptions.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortOptions.field = field;
      this.sortOptions.direction = 'asc';
    }
    this.applyFiltersAndSort();
  }

  resetFilters() {
    this.searchTerm = '';
    this.filters = {
      statut: '',
      priorite: '',
      agence: '',
      dateDebut: undefined,
      dateFin: undefined,
    };
    this.applyFiltersAndSort();
  }

  refreshData() {
    this.isRefreshing = true;
    setTimeout(() => {
      this.loadProcessusData();
      this.isRefreshing = false;
    }, 1000);
  }

  toggleProcessusSelection(id: string) {
    if (this.selectedProcessus.has(id)) {
      this.selectedProcessus.delete(id);
    } else {
      this.selectedProcessus.add(id);
    }
    this.showBulkActions = this.selectedProcessus.size > 0;
  }

  selectAllProcessus() {
    const currentPageProcessus = this.getPaginatedProcessus();
    const allSelected = currentPageProcessus.every((p) =>
      this.selectedProcessus.has(p.id)
    );

    if (allSelected) {
      currentPageProcessus.forEach((p) => this.selectedProcessus.delete(p.id));
    } else {
      currentPageProcessus.forEach((p) => this.selectedProcessus.add(p.id));
    }
    this.showBulkActions = this.selectedProcessus.size > 0;
  }

  getPaginatedProcessus(): Processus[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredProcessus.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Méthodes utilitaires pour l'affichage
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      EN_ATTENTE: 'En attente',
      ASSIGNE: 'Assigné',
      A_MODIFIER: 'À modifier',
      REJETE: 'Rejeté',
      JUSTIFIE: 'Justifié',
      CLOTURE: 'Clôturé',
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string) {
    const icons: { [key: string]: any } = {
      EN_ATTENTE: Clock,
      ASSIGNE: Users,
      A_MODIFIER: AlertTriangle,
      REJETE: XCircle,
      JUSTIFIE: CheckCircle,
      CLOTURE: FileText,
    };
    return icons[status] || AlertCircle;
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      HAUTE: 'Haute',
      NORMALE: 'Normale',
      BASSE: 'Basse',
    };
    return labels[priority] || priority;
  }

  formatMontant(montant: number, devise: string = 'XAF'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise === 'XAF' ? 'XAF' : devise,
      minimumFractionDigits: 0,
    }).format(montant);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  isProcessusSelected(id: string): boolean {
    return this.selectedProcessus.has(id);
  }

  isAllCurrentPageSelected(): boolean {
    const currentPageProcessus = this.getPaginatedProcessus();
    return (
      currentPageProcessus.length > 0 &&
      currentPageProcessus.every((p) => this.selectedProcessus.has(p.id))
    );
  }

  getDisplayedItemsEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredProcessus.length
    );
  }

  // Actions
  viewProcessus(processus: Processus) {
    console.log('Voir processus:', processus);
  }

  editProcessus(processus: Processus) {
    console.log('Modifier processus:', processus);
  }

  // Définition unique de la méthode deleteProcessus
  deleteProcessus(processus: Processus) {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer le processus ${processus.numeroProcessus} ?`
      )
    ) {
      this.allProcessus = this.allProcessus.filter(
        (p) => p.id !== processus.id
      );
      this.calculateStats();
      this.updateStatusCounts();
      this.applyFiltersAndSort();
    }
  }

  exportToExcel() {
    console.log('Export vers Excel');
  }

  bulkAssign() {
    console.log('Assignation en lot:', Array.from(this.selectedProcessus));
  }

  bulkDelete() {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer ${this.selectedProcessus.size} processus ?`
      )
    ) {
      this.allProcessus = this.allProcessus.filter(
        (p) => !this.selectedProcessus.has(p.id)
      );
      this.selectedProcessus.clear();
      this.showBulkActions = false;
      this.calculateStats();
      this.updateStatusCounts();
      this.applyFiltersAndSort();
    }
  }

  canEdit(processus: Processus): boolean {
    return ['EN_ATTENTE', 'A_MODIFIER'].includes(processus.statut);
  }

  canDelete(processus: Processus): boolean {
    return processus.statut === 'EN_ATTENTE';
  }

  // Méthode pour appliquer les filtres (référencée dans le code)
  applyFilters() {
    this.applyFiltersAndSort();
  }

  trackByProcessus(index: number, processus: Processus): string {
    return processus.id;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.filteredProcessus.length) {
      this.currentPage++;
    }
  }

  // Ajouter cette méthode manquante
  getStatusCount(status: string): number {
    return this.allProcessus.filter((p) => p.statut === status).length;
  }

  // Ajouter cette méthode manquante
  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      EN_ATTENTE:
        'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs',
      ASSIGNE: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs',
      A_MODIFIER:
        'bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs',
      REJETE: 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs',
      JUSTIFIE: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs',
      CLOTURE: 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs',
    };
    return (
      classes[status] ||
      'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs'
    );
  }

  // Ajouter cette méthode manquante
  getPriorityBadgeClass(priority: string): string {
    const classes: { [key: string]: string } = {
      HAUTE: 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs',
      NORMALE: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs',
      BASSE: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs',
    };
    return (
      classes[priority] ||
      'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs'
    );
  }
}
