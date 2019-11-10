import * as THREE from '../../build/three.module.js';

const idle = 0;
const walk = 1;
const run = 2;
const kick = 3;

export class Character{

  constructor(model, helper, pos){
    this.character = model;
    this.pos = pos!=undefined ? pos:new THREE.Vector3();

    this.helper = helper;

    this.moveSpeed = 10;
    this.direction = new THREE.Vector3();
    this.theta = 0;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.run = false;
    this.kick = false;

    /*
      idle : 0
      walk : 1
      run  : 2
      kick : 3
    */
    this.myActions = [];
    this.myState = idle;
  }
  update(delta, dir, theta){
    dir.y = 0;
    this.direction.copy(dir);
    this.theta = theta;
    this.helper.update(delta);
    this.stateMachine();
    if( this.myState != kick )
     this.move(delta);
  }
  onKeyDown(key){
    switch( key ){
      case 38: /*up*/
      case 87: /*W*/
        this.moveForward = true;
        break;
      case 40: /*down*/
      case 83: /*S*/
        this.moveBackward = true;
        break;
      case 37: /*left*/
      case 65: /*A*/
        this.moveLeft = true;
        break;
      case 39: /*right*/
      case 68: /*D*/
        this.moveRight = true;
        break;
      case 32: /*space*/
        this.kick = true;
        break;
      case 16: /*shift*/
        this.moveSpeed = 20;
        this.run = true;
        break;
      }
    }
  onKeyUp(key){
    switch( key ){
      case 38: /*up*/
      case 87: /*W*/
        this.moveForward = false;
        break;
      case 40: /*down*/
      case 83: /*S*/
        this.moveBackward = false;
        break;
      case 37: /*left*/
      case 65: /*A*/
        this.moveLeft = false;
        break;
      case 39: /*right*/
      case 68: /*D*/
        this.moveRight = false;
        break;
      case 32: /*space*/
        this.kick = false;
        break;
      case 16: /*shift*/
        this.moveSpeed = 10;
        this.run = false;
        break;
    }
  }
  move(delta){
    if( this.moveForward ){

      if( this.moveLeft ){
        this.pos.add(this.direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI/4).normalize().multiplyScalar(this.moveSpeed * delta));
        this.character.rotation.y = this.theta * Math.PI / 360 - (3*Math.PI)/4;
        //this.character.rotation.y = THREE.Math.lerp(this.character.rotation.y, this.theta * Math.PI / 360 + (5*Math.PI)/4, 0.1);
      }
      else if( this.moveRight ){
        this.pos.add(this.direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/4).normalize().multiplyScalar(this.moveSpeed * delta));
        this.character.rotation.y = this.theta * Math.PI / 360 + (3*Math.PI)/4;
        //this.character.rotation.y = THREE.Math.lerp(this.character.rotation.y, this.theta * Math.PI / 360 + (3*Math.PI)/4, 0.1);
      }
      else{
        this.pos.add(this.direction.normalize().multiplyScalar(this.moveSpeed * delta));
        this.character.rotation.y = this.theta * Math.PI / 360 + Math.PI;
        //this.character.rotation.y = THREE.Math.lerp(this.character.rotation.y, this.theta * Math.PI / 360 + Math.PI, 0.1);
      }
    }
    else if( this.moveBackward ){

      if( this.moveLeft ){
        this.pos.sub(this.direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/4).normalize().multiplyScalar(this.moveSpeed * delta));
        this.character.rotation.y = this.theta * Math.PI / 360 - Math.PI/4;
        //this.character.rotation.y = THREE.Math.lerp(this.character.rotation.y, this.theta * Math.PI / 360 - Math.PI/4, 0.1);
      }
      else if( this.moveRight ){
        this.pos.sub(this.direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI/4).normalize().multiplyScalar(this.moveSpeed * delta));
        this.character.rotation.y = this.theta * Math.PI / 360 + Math.PI/4;
        //this.character.rotation.y = THREE.Math.lerp(this.character.rotation.y, this.theta * Math.PI / 360 + Math.PI/4, 0.1);
      }
      else{
        this.pos.sub(this.direction.normalize().multiplyScalar(this.moveSpeed * delta));
        this.character.rotation.y = this.theta * Math.PI / 360 ;
        //this.character.rotation.y = THREE.Math.lerp(this.character.rotation.y, this.theta * Math.PI / 360 , 0.1);
      }
    }
    else if( this.moveLeft ){
      this.pos.add(this.direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI/2).normalize().multiplyScalar(this.moveSpeed * delta));
      this.character.rotation.y = this.theta * Math.PI / 360 - Math.PI/2;
      //this.character.rotation.y = THREE.Math.lerp(this.character.rotation.y, this.theta * Math.PI / 360 - Math.PI/2, 0.1);
    }
    else if( this.moveRight ){
      this.pos.add(this.direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2).normalize().multiplyScalar(this.moveSpeed * delta));
      this.character.rotation.y = this.theta * Math.PI / 360 + Math.PI/2;
      //this.character.rotation.y = THREE.Math.lerp(this.character.rotation.y, this.theta * Math.PI / 360 + Math.PI/2, 0.1);
    }
    this.character.position.copy(this.pos);
  }
  stateMachine(){

    switch (this.myState) {
      case 0:
        this.idleState();
        break;
      case 1:
        this.walkState();
        break
      case 2:
        this.runState();
        break;
      case 3:
        this.kickState();
        break;
      default:
        break;
    }
  }
  idleState(){
    if( this.kick ){
      this.kickState();
      return;
    }
    if( this.moveForward || this.moveBackward || this.moveLeft || this.moveRight ){

      if(!this.run){
        this.myState = walk;
        this.executeCrossFade(this.myActions[idle], this.myActions[walk], 0.1);
      }
      else{
        this.myState = run;
        this.executeCrossFade(this.myActions[idle], this.myActions[run], 0.1);
      }
    }
  }
  walkState(){
    if( this.kick ){
      this.kickState();
      return;
    }
    if( !this.moveForward && !this.moveBackward && !this.moveLeft && !this.moveRight ){
      this.myState = idle;
      this.executeCrossFade(this.myActions[walk], this.myActions[idle], 0.1);
    }
    else {
      if( this.run ){
        this.myState = run;
        this.executeCrossFade(this.myActions[walk], this.myActions[run], 0.1);
      }
    }
  }
  runState(){
    if( this.kick ){
      this.kickState();
      return;
    }
    if( !this.run ){

      if( this.moveForward || this.moveBackward || this.moveLeft || this.moveRight ){
        this.myState = walk;
        this.executeCrossFade(this.myActions[run], this.myActions[walk], 0.2);
      }
      else{
        this.myState = idle;
        this.executeCrossFade(this.myActions[run], this.myActions[idle], 0.2);
      }
    }
    else{
      if( !this.moveForward && !this.moveBackward && !this.moveLeft && !this.moveRight ){
        this.myState = idle;
        this.executeCrossFade(this.myActions[run], this.myActions[idle], 0.2);
      }
    }
  }
  kickState(){
    if(this.kick && this.myState != kick){
      this.executeCrossFade(this.myActions[this.myState], this.myActions[kick], 0.1);
      this.myState = kick;
    }
    else if(this.myState == kick && this.myActions[kick].time >= 1.2 && this.kick == false){
      this.myState = idle;
      this.executeCrossFade(this.myActions[kick], this.myActions[idle], 0.1);
    }
    /*if( this.myActions[kick].isRunning () == false && this.myState != kick){
      this.executeCrossFade(this.myActions[this.myState], this.myActions[kick], 0.2);
      this.myState = kick;
    }
    else if( this.myActions[kick].isRunning () == false && this.myState == kick){
      this.myState = idle;
      this.executeCrossFade(this.myActions[kick], this.myActions[idle], 0.1);
    }*/
  }
  executeCrossFade(startAction, endAction, duration) {

    this.setWeight(endAction, 1);
    endAction.time = 0;
    startAction.crossFadeTo(endAction, duration, false);
  }
  setWeight(action, weight) {

    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
  }
}
