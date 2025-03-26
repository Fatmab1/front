import { Component, OnInit, importProvidersFrom } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormsModule, 
  ReactiveFormsModule, 
  FormBuilder, 
  FormGroup,
  Validators 
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
    ReactiveFormsModule,
    CardModule,
    TreeSelectModule,
    ButtonModule
  ],
  templateUrl: './tree-select-page.component.html',
  styleUrls: ['./tree-select-page.component.css']
})
export class TreeSelectPageComponent implements OnInit {
  formGroup: FormGroup;
  treeData: TreeNode[] = [];
  isLoading = true;
  selectedNode: TreeNode | undefined;

  constructor(
    private fb: FormBuilder,
    private treeService: TreeService
  ) {
    this.formGroup = this.fb.group({
      selectedNode: [null, Validators.required]
    });
  }
  ngOnInit(): void {
    this.loadTreeData();
  }

  loadTreeData(): void {
    this.isLoading = true;
    this.treeService.getTreeNodes().subscribe({
      next: (usines) => {
        this.treeData = this.treeService.transformToTreeNode(usines);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading tree data:', err);
        this.isLoading = false;
        // Consider adding user notification here
      }
    });
  }

  onNodeSelect(event: { node: TreeNode }): void {
    this.selectedNode = event.node;
    this.formGroup.get('selectedNode')?.setValue(event.node);
    console.log('Selected Node:', this.selectedNode);
  }

  onSubmit(): void {
    if (this.formGroup.invalid || !this.selectedNode) {
      // Handle form validation errors
      this.formGroup.markAllAsTouched();
      return;
    }

    const formData = {
      selectedNode: this.selectedNode,
      rawValue: this.formGroup.getRawValue()
    };
    console.log('Form submitted with:', formData);
    // Add your form submission logic here
  }

  getNodeType(node: TreeNode): string {
    if (!node.key) return 'Unknown';
    
    const typeMap: Record<string, string> = {
      'usine': 'Usine',
      'unite': 'Unité de Fabrication',
      'workshop': 'Atelier',
      'machine': 'Machine',
      'sensor': 'Capteur'
    };

    const typeKey = Object.keys(typeMap).find(key => node.key?.startsWith(key));
    return typeKey ? typeMap[typeKey] : 'Unknown';
  }
}