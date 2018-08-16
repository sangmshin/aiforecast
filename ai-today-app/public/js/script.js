// RANDOM IMAGE LOAD
var bg_array = ['../images/01.jpg', '../images/02.jpg', '../images/03.jpg', '../images/04.jpg', '../images/05.jpg', '../images/06.jpg', '../images/07.jpg', '../images/08.jpg', '../images/09.jpg', '../images/10.jpg', '../images/11.jpg', '../images/12.jpg', '../images/13.jpg', '../images/14.jpg', '../images/15.jpg', '../images/16.jpg', '../images/17.jpg', '../images/18.jpg', '../images/19.jpg', '../images/20.jpg', '../images/21.jpg', '../images/22.jpg', '../images/23.jpg', '../images/24.jpg', '../images/25.jpg', '../images/26.jpg', '../images/27.jpg', '../images/28.jpg', '../images/29.jpg', '../images/30.jpg', '../images/31.jpg', '../images/32.jpg', '../images/33.jpg', '../images/34.jpg', '../images/35.jpg', '../images/36.jpg', '../images/37.jpg', '../images/38.jpg', '../images/39.jpg', '../images/40.jpg', '../images/41.jpg', '../images/42.jpg']

var random_bg = bg_array[Math.floor(Math.random() * bg_array.length)];


$('body').css('background', 'url(' + random_bg + ') no-repeat center center')
$('body').css('background-size', 'cover')




function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function (e) {
    var a, b, i, val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function (e) {
          /*insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName("input")[0].value;
          /*close the list of autocompleted values,
          (or any other open lists of autocompleted values:*/
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
      increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) { //up
      /*If the arrow UP key is pressed,
      decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });

  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }

  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}




var allCities = [];

// JQUERT WAYS AJAX
$(document).ready(function () {
  $.ajax({
    url: "/js/allCities_countries.json",
    success: function (result) {

      // REMOVES DUPLICATES OF NAMES
      $.each(result, function (i, el) {
        if ($.inArray(el, allCities) === -1) allCities.push(el);
      });

      // FOR IN 
      //for (let key in result) {
      //  allCities.push(result[key])
      //}

      // FOREACH
      //result.forEach(function(el, i, arr){
      //  allCities.push(el)
      //})

      console.log('allcities:', allCities)



    }
  });



});

/*initiate the autocomplete function on the "myInput" element, and pass along the allCities array as possible autocomplete values:*/
autocomplete(document.getElementById("location"), allCities);
// SHOW ONLY TOP 10 SUGGESTIONS
$('#location').keyup(e => {
  let div_arr = $('#locationautocomplete-list').find('div')
  let start = 10;
  let end = div_arr.length;
  let div_arr_10 = div_arr.slice(start, end);

  $(div_arr_10).hide();
})


$(window).resize(function () {
  let _doc_height = $(document).height();
  let _win_height = $(window).height();
  let _container_height = $('.container').height();


  if (_doc_height > _win_height) {
    $('body').height(_doc_height - 1)
  } else if (_doc_height > _container_height) {
    $('body').height(_win_height - 1)
  }
  if (_container_height > _win_height && _container_height < _doc_height) {
    $('body').height(_container_height)
  }

})

var adjust_height = setInterval(() => {
  let _doc_height = $(document).height();
  if ($('body').height() == _doc_height) {
    clearInterval(adjust_height)
  } else {
    $('body').css('height', _doc_height)
  }
}, 10)