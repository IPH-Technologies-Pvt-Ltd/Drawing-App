import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
@Component({
  selector: 'app-paints',
  templateUrl: './paints.component.html',
  styleUrls: ['./paints.component.css']
})
export class PaintsComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fillColor') fillColorInput!: ElementRef<HTMLInputElement>;
  @ViewChild('sizeSlider') sizeSlider!: ElementRef<HTMLInputElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private brushWidth = 5;
  private selectedTool = 'brush';
  private prevMouseX!: number;
  private prevMouseY!: number;
  private snapshot!: ImageData;
  constructor() {}
  ngAfterViewInit(): void {
    // Move the initialization of ctx to this method
    this.ctx = this.canvasRef.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    window.addEventListener('load', () => {
      this.canvasRef.nativeElement.width = this.canvasRef.nativeElement.offsetWidth;
      this.canvasRef.nativeElement.height = this.canvasRef.nativeElement.offsetHeight;
    });
    const toolBtns = document.querySelectorAll('.tool');
    let colorPicker = document.querySelector('#colorPicker') as HTMLInputElement;
    colorPicker.addEventListener("change",(e)=>{
      if (e.target instanceof HTMLInputElement) {
         this.ctx.strokeStyle = e.target.value;
      }
    })
    // handle multiplr color selection
    let multiColor = document.querySelectorAll (".colors .option");
    multiColor.forEach(multiCol=>{
      multiCol.addEventListener("click",()=>{
        const computedStyle = window.getComputedStyle(multiCol);
        const color = computedStyle.getPropertyValue("background-color");
        this.ctx.strokeStyle = color;
          console.log(color);
      })
    })

    let changeBrushWidth = document.querySelector('#sizeSlider') as HTMLInputElement;
    changeBrushWidth.addEventListener("change",()=>{
      console.log(changeBrushWidth.value);
      this.brushWidth = +(changeBrushWidth.value);
    })
    // here we figure out selectedTool
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelector('.options .active')?.classList.remove('active');
        btn.classList.add('active');
        this.selectedTool = btn.id;
        console.log(btn.id)
      });
    });
    this.canvasRef.nativeElement.addEventListener('mousedown', this.startDraw);
    this.canvasRef.nativeElement.addEventListener('mousemove', this.drawing);
    this.canvasRef.nativeElement.addEventListener('mouseup', () => {
      this.isDrawing = false;
    });
  }   
  private drawRect(e: MouseEvent): void {
        console.log("I am rectangle");
        
        if (!this.ctx || !this.canvasRef || !this.fillColorInput) {
          console.log("Elements are not defined.");
          return;
        }
        if (!this.fillColorInput.nativeElement.checked) {
        
          this.ctx.strokeRect(
            this.prevMouseX,
            this.prevMouseY,
            e.offsetX - this.prevMouseX,
            e.offsetY - this.prevMouseY
          );
        } else {
       
          this.ctx.fillRect(
            this.prevMouseX,
            this.prevMouseY,
            e.offsetX - this.prevMouseX,
            e.offsetY - this.prevMouseY
          );
        }
  }

  
  private drawCircle(e: MouseEvent): void {
    console.log("this is inside circle funcion");
    this.ctx.beginPath();
    const radius = Math.sqrt(Math.pow((this.prevMouseX - e.offsetX), 2) + Math.pow((this.prevMouseY - e.offsetY), 2));
    this.ctx.arc(this.prevMouseX, this.prevMouseY, radius, 0, 2 * Math.PI);
    this.fillColorInput.nativeElement.checked ? this.ctx.fill() : this.ctx.stroke();
  }

  
  private drawTriangle(e: MouseEvent): void {
    if (!this.ctx) return; 
      this.ctx.beginPath();
      this.ctx.moveTo(this.prevMouseX, this.prevMouseY); 
      this.ctx.lineTo(e.offsetX, e.offsetY); 
      this.ctx.lineTo(this.prevMouseX * 2 - e.offsetX, e.offsetY) 
      this.ctx.closePath(); 
      this.fillColorInput.nativeElement.checked? this.ctx.fill() : this.ctx.stroke(); 
  }

  private startDraw = (e: MouseEvent): void =>{
    this.isDrawing = true;
    this.prevMouseX = e.offsetX;
    this.prevMouseY = e.offsetY;
    this.ctx.beginPath();
    this.ctx.lineWidth = this.brushWidth;
    this.snapshot = this.ctx.getImageData(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
  }

  // this function call each time when we are inside canvas
  private drawing = (e: MouseEvent): void => {
    console.log("I am drawing function")
    if (!this.isDrawing) return;
    this.ctx.putImageData(this.snapshot, 0, 0);
    if (this.selectedTool === 'brush') {
      this.ctx.lineTo(e.offsetX, e.offsetY);
      this.ctx.stroke();
    } else if (this.selectedTool === 'rectangle') {
      this.drawRect(e);
    }else if (this.selectedTool === 'circle') {
      this.drawCircle(e);
    }else if (this.selectedTool === 'triangle') {
      this.drawTriangle(e);
    } 
    else if (this.selectedTool === 'eraser') {
      this.erase(e);
    }
  }
  
  private erase(e: MouseEvent): void {
    if (!this.ctx) return; 
    this.ctx.globalCompositeOperation = 'destination-out'; 
    this.ctx.strokeStyle = 'white'; 
    this.ctx.lineWidth = this.brushWidth;
    this.ctx.lineTo(e.offsetX, e.offsetY);
    this.ctx.stroke();
    this.ctx.globalCompositeOperation = 'source-over'; 
  }
  
  clearCanvas(): void {
    console.log("clear canvas function")
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
  }
  
  saveAsImage(): void {
    const canvas = this.canvasRef.nativeElement;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'canvas_image.png';
    link.click();
  }
}
