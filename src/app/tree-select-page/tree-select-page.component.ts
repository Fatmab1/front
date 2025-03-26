import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormsModule, 
  ReactiveFormsModule, 
  FormBuilder, 
  FormGroup 
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TreeSelectModule } from 'primeng/treeselect';
import { ButtonModule } from 'primeng/button';
import { TreeNode } from 'primeng/api';
import { TreeService } from './tree.service';

@Component({
  selector: 'app-tree-select-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // This provides FormBuilder
    CardModule,
    TreeSelectModule,
    ButtonModule
  ],
  templateUrl: './tree-select-page.component.html',
  styleUrls: ['./tree-select-page.component.css']
})
export class TreeSelectPageComponent implements OnInit {

  constructor(
    private fb: FormBuilder, // Now properly injectable
    private treeService: TreeService
  ) {
    this.formGroup = this.fb.group({
      selectedNode: [null]
    });
  }
  formGroup: FormGroup;
  treeData: TreeNode[] = [];
  isLoading = true;
  selectedNode: TreeNode | undefined;

  ngOnInit(): void {
    this.loadTreeData();
  }

  loadTreeData(): void {
    this.treeService.getTreeNodes().subscribe({
      next: (usines) => {
        this.treeData = this.treeService.transformToTreeNode(usines);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading tree data:', err);
        this.isLoading = false;
      }
    });
  }

  onNodeSelect(event: any): void {
    this.selectedNode = event.node;
    console.log('Selected Node:', this.selectedNode);
  }

  onSubmit(): void {
    if (this.formGroup.valid && this.selectedNode) {
      console.log('Form submitted with:', this.selectedNode);
      // Handle form submission with selected node data
    }
  }
  getNodeType(node: TreeNode): string {
    if (node.key?.startsWith('usine')) return 'Usine';
    if (node.key?.startsWith('unite')) return 'Unité de Fabrication';
    if (node.key?.startsWith('workshop')) return 'Atelier';
    if (node.key?.startsWith('machine')) return 'Machine';
    if (node.key?.startsWith('sensor')) return 'Capteur';
    return 'Unknown';
  }
}