const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];

const menu=$('.menu-toggle'), nav=$('.nav-links');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open);});
$$('.nav-links a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false')}));

$('.theme-toggle')?.addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('fs-theme',document.body.classList.contains('dark')?'dark':'light')});
if(localStorage.getItem('fs-theme')==='dark')document.body.classList.add('dark');

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
$$('.reveal').forEach(el=>observer.observe(el));

$$('.tab-btn').forEach(btn=>btn.addEventListener('click',()=>{$$('.tab-btn').forEach(b=>b.classList.remove('active'));$$('.demo-panel').forEach(p=>p.classList.remove('active'));btn.classList.add('active');$('#'+btn.dataset.tab).classList.add('active')}));

let cart=0;$$('.add-cart').forEach(btn=>btn.addEventListener('click',()=>{cart++;$('#cart-count').textContent=cart;btn.textContent='Added ✓';setTimeout(()=>btn.textContent='Add to cart',1200)}));

const sendChat=text=>{if(!text.trim())return;const body=$('#chat-body');const user=document.createElement('div');user.className='user-message';user.textContent=text;body.append(user);setTimeout(()=>{const bot=document.createElement('div');bot.className='bot-message';bot.textContent=text.toLowerCase().includes('sell')?'An e-commerce website sounds like a great fit. We can showcase products, accept payments, and simplify fulfillment.':'Great goal. A focused website strategy can help turn that into a clear, measurable experience.';body.append(bot);body.scrollTop=body.scrollHeight},500);body.scrollTop=body.scrollHeight};
$$('.quick-replies button').forEach(b=>b.addEventListener('click',()=>sendChat(b.dataset.reply)));
$('#chat-form')?.addEventListener('submit',e=>{e.preventDefault();sendChat($('#chat-text').value);$('#chat-text').value=''});

$$('.filter-buttons button').forEach(btn=>btn.addEventListener('click',()=>{$$('.filter-buttons button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');$$('.project-card').forEach(card=>card.classList.toggle('hidden',btn.dataset.filter!=='all'&&card.dataset.category!==btn.dataset.filter))}));

const slider=$('#compare-slider'),old=$('#old-layer'),handle=$('#slider-handle');
slider?.addEventListener('input',()=>{old.style.width=slider.value+'%';handle.style.left=slider.value+'%'});

$('#pricing-mode')?.addEventListener('change',e=>$('.pricing').classList.toggle('monthly',e.target.checked));

$('#contact-form')?.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.target);const subject=encodeURIComponent(`Website project inquiry from ${data.get('name')}`);const body=encodeURIComponent(`Name: ${data.get('name')}\nBusiness: ${data.get('business')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone')}\nService: ${data.get('service')}\n\nProject details:\n${data.get('message')}`);$('#form-status').textContent='Opening your email app...';window.location.href=`mailto:charles.flemingiii@outlook.com?subject=${subject}&body=${body}`});

const back=$('.back-top');window.addEventListener('scroll',()=>back.classList.toggle('show',scrollY>700));back?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
$('#year').textContent=new Date().getFullYear();

const tilt=$('.tilt-card');if(tilt&&matchMedia('(pointer:fine)').matches){tilt.addEventListener('mousemove',e=>{const r=tilt.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;tilt.style.transform=`perspective(1000px) rotateY(${x*8}deg) rotateX(${-y*8}deg)`});tilt.addEventListener('mouseleave',()=>tilt.style.transform='perspective(1000px) rotateY(-4deg) rotateX(2deg)')}

// Expanded technique demos
$$('.spotlight-demo').forEach(demo=>demo.addEventListener('pointermove',e=>{const r=demo.getBoundingClientRect(),orb=$('.spotlight-orb',demo);orb.style.left=`${e.clientX-r.left-75}px`;orb.style.top=`${e.clientY-r.top-75}px`}));
$('.like-button')?.addEventListener('click',e=>{const b=e.currentTarget;b.classList.toggle('active');b.setAttribute('aria-pressed',b.classList.contains('active'));$('span',b).textContent=b.classList.contains('active')?'♥':'♡';$('b',b).textContent=b.classList.contains('active')?'Saved':'Save idea'});
$('.success-button')?.addEventListener('click',e=>{const b=e.currentTarget;b.classList.add('done');$('b',b).textContent='Completed';setTimeout(()=>{b.classList.remove('done');$('b',b).textContent='Complete'},1600)});
const countObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting||entry.target.dataset.ran)return;entry.target.dataset.ran='1';const end=+entry.target.dataset.count,start=performance.now(),duration=1200;const tick=now=>{const p=Math.min((now-start)/duration,1);entry.target.textContent=Math.floor(end*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)}),{threshold:.6});$$('.count-up').forEach(el=>countObserver.observe(el));
const personaCopy={startup:['Launch with confidence.','A fast, polished site built to explain your idea and win early customers.'],local:['Get found and chosen locally.','Clear services, local SEO, reviews, and fast quote paths for nearby customers.'],firm:['Turn expertise into trust.','A refined, credible website that communicates authority and generates qualified inquiries.']};$$('.personal-tabs button').forEach(btn=>btn.addEventListener('click',()=>{$$('.personal-tabs button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const [head,body]=personaCopy[btn.dataset.persona];$('#personal-message').innerHTML=`<strong>${head}</strong><span>${body}</span>`}));
let smartStep=0;const smartQuestions=['What are you building?','What matters most?','When would you like to launch?'];const smartChoices=[['Business site','Online store','Web app'],['More leads','Online sales','Stronger brand'],['This month','1–3 months','Planning ahead']];const renderSmart=()=>{$('#smart-question').textContent=smartQuestions[smartStep];$('.smart-options').innerHTML=smartChoices[smartStep].map(x=>`<button type="button">${x}</button>`).join('');$('#smart-status').textContent=`Step ${smartStep+1} of 3`;$$('.form-progress i').forEach((i,n)=>i.classList.toggle('active',n<=smartStep));$$('.smart-options button').forEach(b=>b.addEventListener('click',()=>{if(smartStep<2){smartStep++;renderSmart()}else{$('#smart-question').textContent='You are ready for a tailored plan.';$('.smart-options').innerHTML='<button type="button" id="smart-reset">Start over</button>';$('#smart-status').textContent='Complete';$$('.form-progress i').forEach(i=>i.classList.add('active'));$('#smart-reset').addEventListener('click',()=>{smartStep=0;renderSmart()})}}))};renderSmart();
$$('[data-access]').forEach(btn=>btn.addEventListener('click',()=>{const demo=$('.access-demo');if(btn.dataset.access==='reset')demo.classList.remove('high-contrast','large-text');else demo.classList.toggle(btn.dataset.access==='contrast'?'high-contrast':'large-text')}));
let testimonialIndex=0;const testimonials=$$('.testimonial'),testimonialDots=$$('.testimonial-dots button');const showTestimonial=i=>{testimonialIndex=(i+testimonials.length)%testimonials.length;testimonials.forEach((t,n)=>t.classList.toggle('active',n===testimonialIndex));testimonialDots.forEach((d,n)=>d.classList.toggle('active',n===testimonialIndex))};$('.testimonial-arrow.prev')?.addEventListener('click',()=>showTestimonial(testimonialIndex-1));$('.testimonial-arrow.next')?.addEventListener('click',()=>showTestimonial(testimonialIndex+1));testimonialDots.forEach((d,n)=>d.addEventListener('click',()=>showTestimonial(n)));let testimonialTimer=setInterval(()=>showTestimonial(testimonialIndex+1),6500);$('.testimonial-shell')?.addEventListener('mouseenter',()=>clearInterval(testimonialTimer));
