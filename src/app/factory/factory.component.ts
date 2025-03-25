import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FactoryService } from './factory.service';

@Component({
  selector: 'app-factory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './factory.component.html',
  styleUrls: ['./factory.component.scss']
})
export class FactoryComponent implements OnInit {

  factoryData: any[] = [];
  selectedFactory: any = null;
  units: any[] = [];
  selectedUnit: any = null;
  workshops: any[] = [];
  selectedWorkshop: any = null;
  machines: any[] = [];
  selectedMachine: any = null;

  constructor(private factoryService: FactoryService) {}

  ngOnInit(): void {
    this.factoryService.getFactoryTree().subscribe({
      next: (data) => {
        this.factoryData = data;
        console.log('✅ Arbre chargé :', this.factoryData);
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement de l\'arbre', err);
      }
    });
  }

  loadFactoryTree(): void {
    this.factoryService.getFactoryTree().subscribe({
      next: (data) => {
        this.factoryData = this.addExpandFlags(data);
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement de l\'arbre', err);
      }
    });
  }
  
  addExpandFlags(nodes: any[]): any[] {
    return nodes.map(node => ({
      ...node,
      expanded: false,
      children: node.children ? this.addExpandFlags(node.children) : []
    }));
  }
  
  editFactory(factory: any) {
    console.log('📝 Modification de:', factory);
    // logiques de modification à ajouter
  }
  
  deleteFactory(id: number) {
    console.log('🗑️ Suppression de l\'usine avec ID:', id);
    // appel à ton service pour supprimer
  }
  toggle(item: any): void {
    item.expanded = !item.expanded;
  }
  
}
