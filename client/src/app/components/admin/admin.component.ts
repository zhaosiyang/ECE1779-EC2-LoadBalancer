import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ApiService} from '../../services/apiService';

interface Instance {
  instanceId: string;
  cpuUtilization: number;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  private formGroup: FormGroup;
  private autoScaleFormControl: FormControl;
  private cpuExpandingThresholdFormControl: FormControl;
  private cpuShrinkingThresholdFormControl: FormControl;
  private expandingRatioFormControl: FormControl;
  private shrinkingRatioFormControl: FormControl;
  private numberOfInstancesToSet: number;
  private autoScaleStatus: boolean = null;
  private instances: Array<Instance> = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {

  }

  ngOnInit() {
    this.autoScaleFormControl = new FormControl('');
    this.cpuExpandingThresholdFormControl = new FormControl('');
    this.cpuShrinkingThresholdFormControl = new FormControl('');
    this.expandingRatioFormControl = new FormControl('');
    this.shrinkingRatioFormControl = new FormControl('');

    this.formGroup = this.fb.group({
      autoScale: this.autoScaleFormControl,
      cpuExpandingThreshold: this.cpuExpandingThresholdFormControl,
      cpuShrinkingThreshold: this.cpuShrinkingThresholdFormControl,
      expandingRatio: this.expandingRatioFormControl,
      shrinkingRatio: this.shrinkingRatioFormControl
    });

    this.refresh();
    this.getInstancesAndCpuUtilization();
  }

  setAdminConfig() {
    const body = {
      autoScale: this.autoScaleFormControl.value,
      cpuExpandingThreshold: this.cpuExpandingThresholdFormControl.value,
      cpuShrinkingThreshold: this.cpuShrinkingThresholdFormControl.value,
      expandingRatio: this.expandingRatioFormControl.value,
      shrinkingRatio: this.shrinkingRatioFormControl.value
    };

    this.apiService.setAdminConfig(body)
      .then(response => {
        alert('success');
        return this.refresh();
      })
      .catch(response => alert('something wrong when updating admin config'));

  }

  refresh() {
    this.apiService.getAdminConfig().then(response => {
      const responseJson = response.json();
      this.autoScaleStatus = responseJson.autoScale ? true : false;
      this.cpuExpandingThresholdFormControl.setValue(responseJson.cpuExpandingThreshold);
      this.cpuShrinkingThresholdFormControl.setValue(responseJson.cpuShrinkingThreshold);
      this.expandingRatioFormControl.setValue(responseJson.expandingRatio);
      this.shrinkingRatioFormControl.setValue(responseJson.shrinkingRatio);
    })
  }

  getInstances() {
    return this.apiService.getInstanceIds()
      .then(response => this.instances = response.json().instanceIds.map(id => {return {cpuUtilization: null, instanceId: id}}))
      .catch(err => {
        alert('something wrong when getting instance info');
        throw err;
      });
  }

  getCpuUtilizationByInstance(instance: Instance) {
    this.apiService.getInstanceCpuUtilization(instance.instanceId)
      .then(response => instance.cpuUtilization = response.json().Datapoints[0].Average)
      .catch(err => {console.log('cpu utilization not available for instance' + instance.instanceId + ' for now!')});
  }

  getInstancesAndCpuUtilization() {
    this.getInstances()
      .then(() => {
        this.instances.forEach((instance: Instance) => {
          this.getCpuUtilizationByInstance(instance);
        });
      })
      .catch(err => {
        console.log(err);
        alert('something wrong when getting cpu utilizations');
      });
  }

  saveInstanceNumber() {
    this.apiService.setNumberOfInstances(this.numberOfInstancesToSet)
      .then(response => {
        this.getInstancesAndCpuUtilization();
        alert('success');
      })
      .catch(err => alert('something wrong when saving instance number'));
  }

  resetApp() {
    this.apiService.resetApp().then(response => alert('success'))
      .catch(err => alert('something wrong when resetting the app!'));
  }

}
