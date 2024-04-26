let cl = console.log;

const movieForm = document.getElementById("movieForm");
const movieContainer = document.getElementById("movieContainer");
const movieModal = document.getElementById("movieModal");
const titleControl = document.getElementById("title");
const imgUrlControl = document.getElementById("imgUrl");
const overviewControl = document.getElementById("overview");
const ratingControl = document.getElementById("rating");
const closeModal = [...document.querySelectorAll(".closeModal")];
const backDrop = document.getElementById("backDrop");
const showModal = document.getElementById("showModal");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");

const baseUrl = `https://movie-fetch-e3917-default-rtdb.asia-southeast1.firebasedatabase.app`;

let movieUrl = `${baseUrl}/movie.json`;


const modalBackDropToggle = ()=>{
	backDrop.classList.toggle("active");
	movieModal.classList.toggle("active");

}

const snackBar = (msg,iconName,time)=>{
    Swal.fire({
		title: msg,
		icon: iconName,
		timer: time
        })
	}

const templating = (arr)=>{
	movieContainer.innerHTML = arr.map(obj =>{
		return `<div class="col-md-4">
		            <div class="card mb-4">
			             <figure class="movieCard mb-0" id="${obj.id}">
				            <img src="${obj.imgUrl}" alt="${obj.title}" title="${obj.title}">
				           <figcaption>
					          <div class="rating-sec">
						        <div class="row">
							      <div class="col-md-10">
								       <h3 class="movieName mb-0">${obj.title}</h3>
							      </div>
							      <div class="col-md-2 align-self-center">
								     ${obj.rating >=5 ? `<span class="bg-success">${obj.rating}</span>`:
									obj.rating <=4 && obj.rating >=3 ?`<span class="bg-warning">${obj.rating}</span>`:
								    obj.rating < 3 ?`<span class="bg-danger">${obj.rating}</span>`:
									`<span class="bg-success">${obj.rating}</span>`}   
						    	  </div>
						      </div>
					          </div>
					          <div class="overview-sec">
					        	 <h4>${obj.title}</h4>
						         <em>Overview</em>
						         <p>${obj.overview}</p>
								 <div class="action">
									<button class="btn btn-info"onclick="onEdit(this)">Edit</button>
									<button class="btn btn-danger"onclick="onDelete(this)">Delete</button>
								</div>
					          </div>
				           </figcaption>
			             </figure>
		            </div>
	             </div>`
	}).join('');
}

const objToArr = (obj)=>{
	let movieArr = [];
	for (const key in obj) {
		movieArr.unshift({...obj[key],id:key})
	}
	return movieArr
}

const makeApiCall = (apiUrl,methodName,msgBody)=>{
	msgBody = msgBody ? JSON.stringify(msgBody) : null
   return  fetch(apiUrl,{
		method: methodName,
		body: msgBody,
		headers :{
			'Content-Type': "Application/json"
		}
	  })
       .then(res =>{
		return  res.json()
	   })
}

makeApiCall(movieUrl,"GET",null)
   .then(data=>{
      let movieArr = objToArr(data);
	  templating(movieArr);
	
    })
	.catch(err =>{
		cl(err)
	})



const onEdit =(e)=>{
	let editId = e.closest(".movieCard").id;
	localStorage.setItem("editId",editId);
	let editUrl = `${baseUrl}/movie/${editId}.json`;
	
	makeApiCall(editUrl,"GET",null)
	.then(data =>{
		cl(data)
		titleControl.value = data.title;
	    imgUrlControl.value = data.imgUrl;
	    ratingControl.value = data.rating;
	    overviewControl.value = data.overview;
		updateBtn.classList.remove("d-none");
		submitBtn.classList.add("d-none");
   window.scrollTo(0,0);
	})
	.catch(err =>{
		cl(err)
	})
	.finally(()=>{
		modalBackDropToggle();
	})

}

const onDelete =(e)=>{
	Swal.fire({
		title: "Are you sure?",
		text: "You won't be able to revert this!",
		icon: "warning",
		showCancelButton: true,
		confirmButtonColor: "#3085d6",
		cancelButtonColor: "#d33",
		confirmButtonText: "Yes, delete it!"
	  }).then((result) => {
		if (result.isConfirmed) {
			let deleteId = e.closest(".movieCard").id;
	        let deleteUrl = `${baseUrl}/movie/${deleteId}.json`;
			
	        makeApiCall(deleteUrl,"DELETE",null)
	         .then(data =>{
		        e.closest(".col-md-4").remove();
				
	          })
				Swal.fire({
					title: "Deleted!",
					text: "Your file has been deleted.",
					icon: "success"
				  });
				
		}
	  });
}

const movieAdd =(obj)=>{
        let card = document.createElement("div");
		card.className = "col-md-4";
		card.id = obj.name;
	    card.innerHTML= `  
		                   <figure class="movieCard mb-0" id="${obj.id}">
		                      <img src="${obj.imgUrl}" alt="${obj.title}" title="${obj.title}">
		                 <figcaption>
			                 <div class="rating-sec">
			                    <div class="row">
				                 <div class="col-md-10">
					                <h3 class="movieName mb-0">${obj.title}</h3>
				                 </div>
				                <div class="col-md-2 align-self-center">
				                 ${obj.rating >=5 ? `<span class="bg-success">${obj.rating}</span>`:
				                obj.rating <=4 && obj.rating >=3 ?`<span class="bg-warning">${obj.rating}</span>`:
				                obj.rating < 3 ?`<span class="bg-danger">${obj.rating}</span>`:
				              `<span class="bg-success">${obj.rating}</span>`}
				           </div>
			           </div>
			       </div>
			            <div class="overview-sec">
				          <h4>${obj.title}</h4>
				          <em>Overview</em>
				         <p>${obj.overview}</p>
				         <div class="action">
				             <button class="btn btn-info"onclick="onEdit(this)">Edit</button>
				            <button class="btn btn-danger"onclick="onDelete(this)">Delete</button>
			             </div>
			          </div>
		            </figcaption>
		       </figure>
             </div>
		   </div>
		
`
						movieContainer.prepend(card);
}

const onMovieCreate = (e)=>{
   e.preventDefault();
   let newMovie ={
	title: titleControl.value,
	imgUrl: imgUrlControl.value,
	rating: ratingControl.value,
	overview: overviewControl.value
   }
  
   makeApiCall(movieUrl,"POST",newMovie)
   .then(res =>{
	  newMovie.id = res.name;
	  movieAdd(newMovie)
	   snackBar(`Movie is ${newMovie.title} Created Successfully`,"success",2000)
   })
   .catch(err =>{
	cl(err)
   })
   .finally(()=>{
	
	  movieForm.reset();
	  modalBackDropToggle();
   })
}

const onUpdateMovie = ()=>{
	let updateId = localStorage.getItem("editId");
	let updateUrl = `${baseUrl}/movie/${updateId}.json`;
	let updateObj = {
		title: titleControl.value,
	    imgUrl: imgUrlControl.value,
	    rating: ratingControl.value,
	    overview: overviewControl.value,
		id: updateId
	}
	

	makeApiCall(updateUrl,"PATCH",updateObj)
	.then(data =>{
          let card = document.getElementById(updateId);
		  card.innerHTML = ` <img src="${updateObj.imgUrl}" alt="${updateObj.title}" title="${updateObj.title}">
		                          <figcaption>
			                         <div class="rating-sec">
			                            <div class="row">
				                           <div class="col-md-10">
					                          <h3 class="movieName mb-0">${updateObj.title}</h3>
				                            </div>
				                            <div class="col-md-2 align-self-center">
					                            ${updateObj.rating >=5 ? `<span class="bg-success">${updateObj.rating}</span>`:
					                            updateObj.rating <=4 && updateObj.rating >=3 ?`<span class="bg-warning">${updateObj.rating}</span>`:
					                            updateObj.rating < 3 ?`<span class="bg-danger">${updateObj.rating}</span>`:
				                               `<span class="bg-success">${updateObj.rating}</span>`}   
				                            </div>
			                            </div>
			                       </div>
			                       <div class="overview-sec">
				                      <h4>${updateObj.title}</h4>
				                      <em>Overview</em>
				                      <p>${updateObj.overview}</p>
				                      <div class="action">
				                         <button class="btn btn-info"onclick="onEdit(this)">Edit</button>
				                         <button class="btn btn-danger"onclick="onDelete(this)">Delete</button>
			                         </div>
			                       </div>
		                        </figcaption>
		                     </figure>
                         </div>
                        </div>`
						snackBar(`Movie is ${updateObj.title} Updated Successfully`,"success",2000)
	})
	.catch(err =>{
		cl(err)
	})
	.finally(()=>{
		
		movieForm.reset();
		updateBtn.classList.add("d-none");
		submitBtn.classList.remove("d-none");
		modalBackDropToggle();
	})
}

showModal.addEventListener("click",modalBackDropToggle);
closeModal.forEach(btn =>{
	btn.addEventListener("click",modalBackDropToggle);
})

movieForm.addEventListener("submit",onMovieCreate);
updateBtn.addEventListener("click",onUpdateMovie);




