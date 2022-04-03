import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {of, switchMap} from 'rxjs';
import {MaterialService} from 'src/app/shared/classes/material.service';
import {Category} from 'src/app/shared/interfaces';
import {CategoriesService} from 'src/app/shared/services/categories.service';

@Component({
  selector: 'app-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.css'],
})
export class CategoriesFormComponent implements OnInit {
  @ViewChild('input') inputRef!: ElementRef;
  form!: FormGroup;
  isNew = true;
  image!: File;
  category!: Category;
  imagePreview: string | ArrayBuffer | null = '';
  constructor(private route: ActivatedRoute, private categoriesService: CategoriesService, private router: Router) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required),
    });
    this.form.disable();
    this.route.params
      .pipe(
        switchMap((params: Params) => {
          if (params['id']) {
            this.isNew = false;
            return this.categoriesService.getById(params['id']);
          }
          return of(null);
        })
      )
      .subscribe({
        next: (category) => {
          if (category) {
            this.category = category;
            this.form.patchValue({
              name: category.name,
            });
            this.imagePreview = category.imageSrc;
            MaterialService.updateTextInputs();
          }
          this.form.enable();
        },
        error: (e) => {
          MaterialService.toast(e.error.message);
        },
      });
  }

  get name() {
    return this.form.get('name') as FormControl;
  }

  triggerClick(): void {
    this.inputRef.nativeElement.click();
  }

  onFileUpload(event: any) {
    const file = event.target.files[0];
    this.image = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  deleteCategory(): void {
    const decision = window.confirm(`Вы уверены что хотите удалить категорию "${this.category.name}"`);

    if (decision) {
      this.categoriesService.delete(this.category._id).subscribe({
        next: (response) => MaterialService.toast(response.message),
        error: (e) => MaterialService.toast(e.error.message),
        complete: () => this.router.navigate(['/categories']),
      });
    }
  }

  onSubmit(): void {
    let obj$;
    this.form.disable();
    if (this.isNew) {
      obj$ = this.categoriesService.create(this.form.value.name, this.image);
    } else {
      obj$ = this.categoriesService.update(this.category._id, this.form.value.name, this.image);
    }
    obj$.subscribe({
      next: (category) => {
        this.category = category;
        this.form.enable();
        MaterialService.toast('Изменения сохранены');
      },
      error: (e) => {
        this.form.enable();
        MaterialService.toast(e.error.message);
      },
    });
  }
}
