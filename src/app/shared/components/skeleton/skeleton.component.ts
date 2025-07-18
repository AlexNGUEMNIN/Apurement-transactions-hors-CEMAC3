import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  imports: [CommonModule],
  template: `
    <div
      [class]="'skeleton ' + additionalClasses"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="borderRadius"
    ></div>
  `,
  styles: [
    `
      .skeleton {
        background: linear-gradient(
          110deg,
          #e2e8f0 8%,
          #f1f5f9 18%,
          #e2e8f0 33%
        );
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
      }

      @keyframes skeleton-loading {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: calc(200% + 100%) 0;
        }
      }
    `,
  ],
})
export class SkeletonComponent {
  @Input() width: string = '100%';
  @Input() height: string = '1rem';
  @Input() borderRadius: string = '0.5rem';
  @Input() additionalClasses: string = '';
}
