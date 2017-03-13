import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {ApiService} from '../../services/apiService';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.css']
})
export class ImageComponent implements OnInit {

  private id: string;
  private image;

  constructor(private activatedRoute: ActivatedRoute, private apiService: ApiService) {
    activatedRoute.params.subscribe((params: Params) => this.id = params['id']);
  }

  ngOnInit() {
    this.apiService.getOneImage(this.id)
      .then(response => this.image = response.json())
      .catch(err => alert('something wrong'))
  }

}
