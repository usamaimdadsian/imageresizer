// import {saveAs} from "../node_modules/file-saver/dist/FileSaver.js"
/*============================================================
                        FUNCTIONS
=============================================================*/
const dataURItoBlob = (dataURI) => {
    const bytes = dataURI.split(',')[0].indexOf('base64') >= 0
      ? atob(dataURI.split(',')[1])
      : unescape(dataURI.split(',')[1]);
    const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const max = bytes.length;
    const ia = new Uint8Array(max);
    for (let i = 0; i < max; i += 1) ia[i] = bytes.charCodeAt(i);
    return new Blob([ia], { type: mime });
};


const resizeImage = ({ file, maxWidth, maxHeight,pr }) => {
    const reader = new FileReader();
    const image = new Image();
    const canvas = document.createElement('canvas');

    const resize = () => {
        let { width, height } = image;
        if(pr){
            let maxSize = (maxWidth > maxHeight)? maxWidth:maxHeight;
            if (width > height) {
            if (width > maxSize) {
                height *= maxSize / width;
                width = maxSize;
            }
            } else if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
            }
        }else{
            width = maxWidth
            height = maxHeight
        }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(image, 0, 0, width, height);
  
      const dataUrl = canvas.toDataURL('image/jpeg');
  
      return dataURItoBlob(dataUrl);
    };
  
    return new Promise((ok, no) => {
      if (!file.type.match(/image.*/)) {
        no(new Error('Not an image'));
        return;
      }
  
      reader.onload = (readerEvent) => {
        image.onload = () => ok(resize());
        image.src = readerEvent.target.result;
      };
  
      reader.readAsDataURL(file);
    });
};
function downloadBlob(blob, name = 'file.txt') {
    // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
    // const blobUrl = URL.createObjectURL(blob);
    let blobUrl = blob;
  
    // Create a link element
    const link = document.createElement("a");
  
    // Set link's href to point to the Blob URL
    link.href = blobUrl;
    link.download = name;
  
    // Append link to the body
    document.body.appendChild(link);
  
    // Dispatch click event on the link
    // This is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
      new MouseEvent('click', { 
        bubbles: true, 
        cancelable: true, 
        view: window 
      })
    );
  
    // Remove link from body
    document.body.removeChild(link);
}

/*==========================================================
                        CODE
============================================================*/

var app = new Vue({
    el: '#result',
    data: {
      oimg: [],
      rimg: [],
      width: 200,
      height: 200,
      files:"",
      pr: false, // Preserve Ratio
    },

    methods: {
        setFiles: function(e){
            this.files = e.target.files;
        },
        downloadResized: async function(e){
          if(this.rimg.length > 1){
            let zip = new JSZip();
            zip.file("file.jpeg",await fetch(this.rimg[0]).then(r => r.blob()))
            zip.file("file1.jpeg",await fetch(this.rimg[1]).then(r => r.blob()))
            zip.generateAsync({type: "base64"}).then(function(content){
              let blob = "data:application/zip;base64,"+content;
              downloadBlob(blob,"pxzoon"+new Date().getTime()+".zip");
            })
            // console.log(blob)
            // FileSaver.saveAs(blob,"pxzoon"+new Date().getTime()+".zip")
          }else{
            let blob = await fetch(this.rimg[0]).then(r => r.blob());
            let ext = blob.type.replace(/.+\//,"")
            downloadBlob(this.rimg[0],"pxzoon"+new Date().getTime()+"."+ext);
          }
        },
        convertImage: function(ev)
        {
            this.rimg = []
            this.oimg = []
            if(this.files)
            {
                for(let i=0; i<this.files.length; i++){
                    // console.log('Pakistan Zindabad')
                    let file = this.files[i]
                    if(!file.type.match(/image.*/)){
                        // no(new Error('Not an Image'))
                        console.log('not an image');
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = (e) => this.oimg.push(e.target.result);
                    
                    reader.readAsDataURL(file);
                    
                    resizeImage({file: file, maxWidth: this.width,maxHeight:this.height, pr: this.pr}).then((rimage)=>{
                        this.rimg.push(URL.createObjectURL(rimage));
                    }).catch((err)=>{
                        console.error(err)
                    });
                }
            }
            else
            {
                console.log("Images are not selected")
            }
        }
    }
  })