var searchbtn = document.querySelector('#search');
var form = document.querySelector('#myForm');
var removebtn=document.querySelector('#removeSearch');
var listbtn=document.querySelector('#list');
var header=document.querySelector('#head');
var hibtn=document.querySelector('#hi');
var des=document.querySelector('#des');
var navi=document.querySelector('#navi');
var listRemove=document.querySelector('#listRemove');
var note=document.querySelector('#note5');
var l3=document.querySelector('#list3');
var r3=document.querySelector('#listRemove3');


searchbtn.addEventListener('click', function(){
    l3.style.display='none';
    r3.style.display = 'none';
    navi.style.display='none';
    des.style.display='none';

    form.style.display='block';
    removebtn.style.display='block';
    searchbtn.style.display='none';
    header.style.display='none';
    listbtn.style.display='none';
    hibtn.style.display='none';
    des.style.display='none';
    navi.style.display='none';
    listRemove.style.display='none';
 


 
})

removebtn.addEventListener('click', function(){
    l3.style.display='block';
    des.style.display='block';

    form.style.display='none';
    searchbtn.style.display='block';
    removebtn.style.display='none';
    header.style.display='block';
   // listbtn.style.display='block';
    hibtn.style.display='block';

})
listbtn.addEventListener('click', function(){
    form.style.display='none';
    searchbtn.style.display='block';
    removebtn.style.display='none';
    header.style.display='block';
    listbtn.style.display='none';
    hibtn.style.display='none';
    des.style.display='none';
    navi.style.display='block';
    listRemove.style.display='block';


})

listRemove.addEventListener('click', function(){
    navi.style.display='none';
    listbtn.style.display='block';
    listRemove.style.display='none';
    hibtn.style.display='block';
    des.style.display='block';

})
l3.addEventListener('click', function(){
   note.style.display='block';
   navi.style.display = 'block';
   l3.style.display = 'none';
   r3.style.display = 'block';
   des.style.display='none';

});
 r3.addEventListener('click', function(){
    note.style.display='none';
    navi.style.display = 'none';
    l3.style.display = 'block';
    r3.style.display = 'none';
    des.style.display='block';

 });


 