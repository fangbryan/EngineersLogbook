import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { NavController } from '@ionic/angular';
import { DatabaseService, User } from '../services/database.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  validationsForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  toast: any;

  validationMessages = {
   name: [
     { type: 'required', message: 'Name is required.' }],
   email: [
     { type: 'required', message: 'Email is required.' },
     { type: 'pattern', message: 'Enter a valid email.' }
   ],
   company: [
     { type: 'required', message: 'Team/Codename is required.' },
   ],
   password: [
     { type: 'required', message: 'Password is required.' },
     { type: 'minlength', message: 'Password must be at least 5 characters long.' }
   ],
   confirmPassword: [
    { type: 'required', message: 'You need to confirm your password.' },
  ],
   licenseNum: [
    { type: 'required', message: 'License Number is required.' },
    { type: 'minlength', message: 'License Number must be at least 5 characters long.' }
  ]
 };

  constructor(
    private navCtrl: NavController,
    private authService: AuthenticationService,
    private database: DatabaseService,
    private formBuilder: FormBuilder,
    public toastController: ToastController
  ) {}

  ngOnInit(){
    this.validationsForm = this.formBuilder.group({
      name: new FormControl('', Validators.compose([
        Validators.required
      ])),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      company: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
      confirmPassword: new FormControl('', Validators.required),
      licenseNum: new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
      licenseType: new FormControl('', Validators.compose([
        Validators.required
      ]))
    });
  }

  async tryRegister(value){
  
    //console.log(`tryRegister: ${JSON.stringify(value)}`);
    if (this.validationsForm.get('password').value !== this.validationsForm.get('confirmPassword').value) {
      this.errorMessage = 'Password do not match';
    }
    else {
      try { 
        const res = await this.authService.registerUser(value);
        
        //console.log(`success: ${JSON.stringify(res)}`);
        
        var new_user: User = {
          name: value.name,
          email: res.user.email,
          fleet: "30SCE",  // TODO: This should be an input field
          company: value.company, 
          is_driver: true,
          licence_num: value.licenseNum,
          licence_type: value.licenseType,
          created: this.database.getTimeStamp()
        };
        await this.database.write('user',res.user.email,new_user); 
        
        this.errorMessage = '';
        this.successMessage = 'Your account has been created. Please log in.';
        this.showToast(this.successMessage);
        
      } catch(err) {
        console.log(err);
        this.errorMessage = err.message;
        this.successMessage = '';
      }
    }
  }

  goLoginPage() {
    this.navCtrl.navigateBack('');
  }

  showToast(msg) {
    this.toastController.create({
      message: msg,
      duration: 2000,
      showCloseButton: true,
      closeButtonText: 'OK',
      position: 'middle'
    }).then((obj) => {
      obj.present();
      this.navCtrl.navigateBack('');
    });
  }
 
}
