(()=>{
  const CONTENT='fs-content-overrides-v1', IMAGES='fs-image-overrides-v1';
  const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return {}}};
  const write=(k,v)=>{localStorage.setItem(k,JSON.stringify(v));window.dispatchEvent(new CustomEvent('fs-selection-change'))};
  const toast=msg=>{let t=document.getElementById('fs-inline-toast');if(!t){t=document.createElement('div');t.id='fs-inline-toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),1800)};
  function editText(el){
    const key=el.dataset.contentKey,label=el.dataset.contentLabel||'Text', store=read(CONTENT);
    const current=store[key]??el.textContent.trim();
    const next=prompt(`Edit ${label}:`,current);
    if(next===null)return;
    if(next.trim()==='') delete store[key]; else store[key]=next.trim();
    write(CONTENT,store);toast(`${label} updated`);
  }
  function resize(file,done){
    const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const max=1600,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);done(c.toDataURL('image/jpeg',.84))};img.src=r.result};r.readAsDataURL(file)
  }
  function editImage(el){
    const key=el.dataset.imageSlot,label=el.dataset.imageLabel||'Image';
    const input=document.createElement('input');input.type='file';input.accept='image/*';input.onchange=()=>{const f=input.files?.[0];if(!f)return;resize(f,data=>{const store=read(IMAGES);store[key]=data;try{write(IMAGES,store);toast(`${label} replaced`)}catch(e){alert('This image is too large to save in the browser. Choose a smaller image.')}})};input.click();
  }
  function bind(root){
    if(!root||root.dataset.inlineEditorBound)return;root.dataset.inlineEditorBound='1';
    root.addEventListener('click',e=>{
      const img=e.target.closest('[data-image-slot]');
      const txt=e.target.closest('[data-content-key]');
      if(!img&&!txt)return;
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      img?editImage(img):editText(txt);
    },true);
  }
  window.FSInlineEditor={bind};
  document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('#catalog-live-preview,#catalog-home-live-preview,#assembled-site').forEach(bind));
})();
