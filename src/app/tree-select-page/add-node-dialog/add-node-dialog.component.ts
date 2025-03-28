import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';

interface NodeType {
  parentNode: any;
  name: string;
  type: string;
  parentType: string;
}

@Component({
  selector: 'app-add-node-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DividerModule
  ],
  template: `
    <div class="p-fluid grid p-2">
      <div class="col-12">
        <h3 class="text-center">Ajouter à {{ parentNode?.label || 'Nœud' }}</h3>
        <p-divider></p-divider>
      </div>

      <div class="col-12 field">
        <label for="name" class="block font-medium mb-2">Nom</label>
        <input
          id="name"
          type="text"
          pInputText
          [(ngModel)]="name"
          class="w-full"
          autocomplete="off"
          placeholder="Entrez le nom"
        />
      </div>

      <div class="col-12 field" *ngIf="parentNodeType !== 'Capteur'">
        <label for="type" class="block font-medium mb-2">Type</label>
        <p-dropdown
          id="type"
          [options]="childTypes"
          [(ngModel)]="selectedType"
          [style]="{ width: '100%' }"
          placeholder="Sélectionnez un type"
        ></p-dropdown>
      </div>

      <div class="col-12 flex justify-content-end gap-2 mt-4">
        <button
          pButton
          label="Annuler"
          (click)="ref.close()"
          class="p-button-text"
          icon="pi pi-times"
        ></button>
        <button
          pButton
          label="Ajouter"
          (click)="onAdd()"
          class="p-button-success"
          icon="pi pi-check"
          [disabled]="!isFormValid()"
        ></button>
      </div>
    </div>
  `,
  styles: [`
    .field {
      margin-bottom: 1.5rem;
    }
  `]
})
export class AddNodeDialogComponent {
  name = '';
  selectedType = '';
  parentNodeType = '';
  parentNode: any;
  childTypes: string[] = [];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.parentNode = this.config.data.parentNode;
    this.parentNodeType = this.config.data.nodeType;
    this.setupChildTypes();
  }

  private setupChildTypes(): void {
    const typeMap: Record<string, string[]> = {
      'Usine': ['Unité de Fabrication'],
      'Unité de Fabrication': ['Workshop'],
      'Atelier': ['Machine'],
      'Machine': ['Capteur']
    };

    this.childTypes = typeMap[this.parentNodeType] || [];
    
    // Ensure a default type is selected if available
    if (this.childTypes.length > 0) {
      this.selectedType = this.childTypes[0];
    }
  }

  isFormValid(): boolean {
    return !!(
      this.name.trim() && 
      (this.parentNodeType === 'Machine' || this.selectedType)
    );
  }

  onAdd(): void {
    // Additional validation before closing
    if (!this.isFormValid()) {
      return;
    }

    const nodeData: NodeType = {
      parentNode: this.parentNode,
      name: this.name.trim(),
      type: this.selectedType || 'Capteur',
      parentType: this.parentNodeType
    };

    this.ref.close(nodeData);
  }
}