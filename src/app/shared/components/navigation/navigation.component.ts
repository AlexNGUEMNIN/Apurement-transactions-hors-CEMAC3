import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  LucideAngularModule,
  Menu,
  X,
  BarChart3,
  Bell,
  FileText,
  Plus,
  Upload,
  Search,
  FileBarChart,
  Users,
  Settings,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service';

interface User {
  name: string;
  role: string;
  email: string;
  initials: string;
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Icons
  readonly Menu = Menu;
  readonly X = X;
  readonly BarChart3 = BarChart3;
  readonly Bell = Bell;
  readonly FileText = FileText;
  readonly Plus = Plus;
  readonly Upload = Upload;
  readonly Search = Search;
  readonly FileBarChart = FileBarChart;
  readonly Users = Users;
  readonly Settings = Settings;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly ChevronDown = ChevronDown;

  // State
  isOpen = false;
  showUserMenu = false;
  notificationCount = 0;
  pendingProcessCount = 0;

  // Current user
  currentUser: User = {
    name: 'Administrateur',
    role: 'Admin Système',
    email: 'admin@afrilandfirstbank.com',
    initials: 'AD',
  };

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // Subscribe to notification updates
    this.notificationService
      .getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.notificationCount = count;
      });

    // Initialize pending process count (example)
    this.pendingProcessCount = 5;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // Close sidebar on mobile when resizing to desktop
    if (window.innerWidth >= 1024) {
      this.isOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close user menu when clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile')) {
      this.showUserMenu = false;
    }
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  closeSidebar() {
    this.isOpen = false;
  }

  closeSidebarOnMobile() {
    // Only close on mobile
    if (window.innerWidth < 1024) {
      this.isOpen = false;
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  viewProfile() {
    this.showUserMenu = false;
    this.router.navigate(['/profile']);
  }

  logout() {
    this.showUserMenu = false;
    // Add logout logic here
    console.log('Déconnexion en cours...');
    // this.authService.logout();
    // this.router.navigate(['/login']);
  }
}
