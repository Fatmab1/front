import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-node-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, DropdownModule],
  template: `
    <div class="p-fluid">
      <div class="p-field">
        <label for="name">Name</label>
        <input id="name" type="text" pInputText [(ngModel)]="name" />
      </div>
      <div class="p-field" *ngIf="parentNodeType !== 'Capteur'">
        <label for="type">Type</label>
        <p-dropdown [options]="childTypes" [(ngModel)]="selectedType"></p-dropdown>
      </div>
      <div class="p-d-flex p-jc-end p-mt-3">
        <button pButton label="Cancel" (click)="ref.close()" class="p-button-text"></button>
        <button pButton label="Add" (click)="onAdd()" class="p-button-success"></button>
      </div>
    </div>
  `
})
export class AddNodeDialogComponent {
  name = '';
  selectedType = '';
  parentNodeType = '';
  childTypes: string[] = [];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.parentNodeType = this.config.data.nodeType;
    this.setupChildTypes();
  }

  setupChildTypes(): void {
    const typeMap: Record<string, string[]> = {
      'Usine': ['Unité de Fabrication'],
      'Unité de Fabrication': ['Atelier'],
      'Atelier': ['Machine'],
      'Machine': ['Capteur']
    };
    this.childTypes = typeMap[this.parentNodeType] || [];
    this.selectedType = this.childTypes[0];
  }

  onAdd(): void {
    if (this.name.trim()) {
      this.ref.close({
        parentNode: this.config.data.parentNode,
        name: this.name,
        type: this.selectedType
      });
    }
  }
}