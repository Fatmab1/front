import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TreeSelectModule } from 'primeng/treeselect';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TreeNode } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { TreeService } from './tree.service';

@Component({
  selector: 'app-tree-select-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TreeSelectModule,
    CardModule,
    ButtonModule,
  ],
  templateUrl: './tree-select-page.component.html',
  styleUrls: ['./tree-select-page.component.css']
})
export class TreeSelectFormComponent implements OnInit {
  formGroup: FormGroup;
  nodes: TreeNode[] = [];
  private treeService = inject(TreeService); 
data: any;
  
  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      selectedNodes: [null]
    });
  }

  ngOnInit(): void {
    
     this.loadTreeData();
  }

  loadTreeData(): void {
    this.data = ['Option 1', 'Option 2', 'Option 3'];
  }

  onSubmit(): void {
    console.log('Valeur sélectionnée :', this.formGroup.get('selectedNodes')?.value);
  }
}
