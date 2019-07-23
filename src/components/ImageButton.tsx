import * as React from 'react';
import ReactDOM from 'react-dom';

interface coord {
  XCoord: number, YCoord: number
}

export class ImageButton extends React.Component {

  
    
  

  render() {
    //let canvas: any = this.refs.canvas;
    return (
      <div>
        <canvas ref="canvas" width={400} height={320}/>
        
      </div>
    );
  }
}

function getCoord(num: number) {
  let x: number = (((num-1) % 8) * 76) * 2;
  let y: number = (Math.floor((num-1) / 8) % 8) * 76;
  let res: coord = {XCoord: x, YCoord: y};
  return res;
}

enum char {
  Makoto,
  Mitsuki,
  Jyun
}

/*
getClippedRegion(image: any, x: number, y: number) {

    let canvas = document.createElement('canvas');
    let ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

    canvas.width = 76;
    canvas.height = 76;

    if (ctx != null) {
      //                   source region/dest. region
      ctx.drawImage(image, x, y, 76, 76, 0, 0, 76, 76);
    }

    return canvas;
  }

  drawCanvas() {
    
    let canvas: any = document.getElementById("canvas");
    let ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');


    let image = React.createElement('h1', {src: "/characters.jpg"}, 'Characters');
    let c = getCoord(char.Jyun);
    let clip = this.getClippedRegion(image, c.XCoord, c.YCoord);

    console.log("damn");
    
    if (ctx != null) {
      console.log("fuck");
      ctx.drawImage(clip, 0, 0);
    }
*/