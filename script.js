/* ==========================================================================
   VENUO — script.js
   Yeh file poori site ka BEHAVIOUR/LOGIC handle karti hai:
   - venues ka data
   - filter/search kaam karna
   - venue cards ko screen par banana (render karna)
   - modal (popup) open/close karna
   - "organize event" form ka kaam karna
   - mobile hamburger menu

   Poora code ek IIFE (Immediately Invoked Function Expression) ke andar
   likha gaya hai — matlab yeh function turant khud-ba-khud chal jaata hai.
   Fayda: andar ke saare variables "private" rehte hain, bahar kisi aur
   script se clash nahi karte.
   ========================================================================== */
(function(){
  "use strict"; // strict mode - chhoti-moti coding galtiyon ko turant pakad leta hai

  /* --------------------------------------------------------------------
     STEP 1: DATA
     Yeh hamara "database" hai — real project mein yeh data kisi server/
     API se aata, yahan hum seedha ek JS array mein rakh rahe hain taaki
     project khud-nirbhar (self-contained) rahe.
     -------------------------------------------------------------------- */
  var venues = [
    { id:1, name:"The Glasshouse Loft", city:"Brooklyn, NY", type:"Loft", capacity:240, price:1450,
      desc:"Exposed brick and floor-to-ceiling windows over the East River. Comes with an in-house sound system and a freight elevator for easy load-in.",
      amenities:["In-house AV","Freight elevator","Rooftop access","Catering kitchen"] },
    { id:2, name:"Marigold Botanical Garden", city:"Austin, TX", type:"Garden", capacity:180, price:1100,
      desc:"An open-air garden pavilion surrounded by native wildflower beds. Best booked for daytime and golden-hour events; string lighting available for evenings.",
      amenities:["Outdoor pavilion","String lighting","On-site parking","Rain contingency tent"] },
    { id:3, name:"The Palladium Theater", city:"Chicago, IL", type:"Theater", capacity:520, price:2600,
      desc:"A restored 1920s vaudeville house with a full stage, balcony seating, and house lighting rig — built for keynotes and performances alike.",
      amenities:["Full stage & rig","Balcony seating","Green room","Box office"] },
    { id:4, name:"Skyline Rooftop 12", city:"New York, NY", type:"Rooftop", capacity:150, price:1900,
      desc:"A twelfth-floor rooftop with a retractable canopy and skyline views in every direction. Heaters on site for shoulder-season bookings.",
      amenities:["Retractable canopy","Bar setup","Heaters","City views"] },
    { id:5, name:"The Farrow Ballroom", city:"New Orleans, LA", type:"Ballroom", capacity:400, price:2100,
      desc:"A grand hall with crystal chandeliers and a sprung dance floor, walkable from the French Quarter. Popular for galas and formal receptions.",
      amenities:["Sprung dance floor","Chandelier lighting","Bridal suite","Valet available"] },
    { id:6, name:"Foundry Six Warehouse", city:"Portland, OR", type:"Warehouse", capacity:300, price:1250,
      desc:"A raw concrete warehouse with 20-foot ceilings, ideal for builds that need scale — trade shows, art installs, and large product reveals.",
      amenities:["20ft ceilings","Loading dock","Flexible power","Blackout capable"] },
    { id:7, name:"Cedar & Vine Courtyard", city:"Austin, TX", type:"Garden", capacity:90, price:800,
      desc:"An intimate courtyard tucked behind a converted bungalow, shaded by mature cedar trees — a favorite for small receptions and workshops.",
      amenities:["Shaded courtyard","Fire pit","Small kitchen","Street parking"] },
    { id:8, name:"The Wharf Pavilion", city:"Seattle, WA", type:"Loft", capacity:130, price:1050,
      desc:"A converted pier warehouse with water views and original timber beams. Tide-dependent load-in windows, so plan deliveries early.",
      amenities:["Water views","Timber beams","Loading access","Heating"] },
    { id:9, name:"Union Hall Ballroom", city:"Chicago, IL", type:"Ballroom", capacity:260, price:1700,
      desc:"A mid-century ballroom with terrazzo floors and a mezzanine bar, recently restored while keeping its original signage intact.",
      amenities:["Mezzanine bar","Terrazzo floor","Coat check","In-house DJ booth"] }
  ];

  /* --------------------------------------------------------------------
     STEP 2: HTML ELEMENTS KO PAKADNA (DOM references)
     getElementById / querySelector se hum HTML ke elements ko JS variable
     mein store kar lete hain, taaki baar baar dhoondna na pade.
     -------------------------------------------------------------------- */
  var grid = document.getElementById('venueGrid');
  var resultCount = document.getElementById('resultCount');
  var cityFilter = document.getElementById('cityFilter');
  var typeFilter = document.getElementById('typeFilter');
  var capFilter = document.getElementById('capFilter');
  var searchInput = document.getElementById('searchInput');
  var evVenueSelect = document.getElementById('evVenue');

  /* Helper function: array mein se duplicate values hata kar,
     baaki ko alphabetically sort kar deta hai.
     Example: ["Chicago","Austin","Chicago"] -> ["Austin","Chicago"] */
  function uniqueSorted(arr){
    return Array.from(new Set(arr)).sort();
  }

  /* --------------------------------------------------------------------
     STEP 3: FILTER DROPDOWNS KO DATA SE BHARNA
     Page load hote hi, city aur type dropdown ke <option> tags
     venues array se automatically ban jaate hain (hardcode nahi karna
     padta HTML mein).
     -------------------------------------------------------------------- */
  function populateFilters(){
    // Saari cities nikal kar "City" dropdown mein daal do
    uniqueSorted(venues.map(function(v){return v.city;})).forEach(function(c){
      var o = document.createElement('option'); o.value = c; o.textContent = c;
      cityFilter.appendChild(o);
    });
    // Saare space-types nikal kar "Type" dropdown mein daal do
    uniqueSorted(venues.map(function(v){return v.type;})).forEach(function(t){
      var o = document.createElement('option'); o.value = t; o.textContent = t;
      typeFilter.appendChild(o);
    });
    // Event-planner form ke "Venue" dropdown mein bhi saare venues daal do
    venues.forEach(function(v){
      var o = document.createElement('option');
      o.value = v.id; o.textContent = v.name + ' — ' + v.city;
      evVenueSelect.appendChild(o);
    });
  }

  /* Venue card ke top wale "photo" area ke liye color gradient return karta hai.
     Real photo nahi hai — space-type ke hisaab se ek matching gradient dikha
     dete hain, taaki bina image ke bhi card achha lage. */
  function artGradient(type){
    var palettes = {
      Loft:      ['#3B3F63','#1E2240'],
      Garden:    ['#5C7A52','#33472F'],
      Theater:   ['#7A2E2A','#3C1613'],
      Rooftop:   ['#3E5A72','#1B2C3A'],
      Ballroom:  ['#6B4A8A','#301F44'],
      Warehouse: ['#565656','#232323']
    };
    var p = palettes[type] || ['#3B3F63','#1E2240'];
    return 'linear-gradient(135deg,' + p[0] + ',' + p[1] + ')';
  }

  /* --------------------------------------------------------------------
     STEP 4: MAIN FILTER + RENDER FUNCTION
     Yeh function sabse important hai. Jab bhi user search box mein type
     kare, ya koi dropdown badle, yeh function chalta hai aur:
       1) venues array ko current filters ke hisaab se chhaanta hai (filter)
       2) bache hue venues ke liye HTML cards banata hai (render)
     -------------------------------------------------------------------- */
  function renderGrid(){
    // Pehle current filter values nikal lo
    var q = searchInput.value.trim().toLowerCase();
    var city = cityFilter.value;
    var type = typeFilter.value;
    var minCap = parseInt(capFilter.value, 10) || 0;

    // .filter() se venues array mein se sirf woh venues rakho jo
    // saari conditions match karte hon
    var filtered = venues.filter(function(v){
      var matchesQuery = !q || v.name.toLowerCase().indexOf(q) > -1 || v.city.toLowerCase().indexOf(q) > -1;
      var matchesCity = !city || v.city === city;
      var matchesType = !type || v.type === type;
      var matchesCap = v.capacity >= minCap;
      return matchesQuery && matchesCity && matchesType && matchesCap;
    });

    // Grid ko khali karo aur result count text update karo
    grid.innerHTML = '';
    resultCount.textContent = filtered.length + (filtered.length === 1 ? ' venue matches your filters' : ' venues match your filters');

    // Agar koi venue match nahi hua, ek "empty state" message dikha do
    if(filtered.length === 0){
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No venues match those filters yet. Try widening your search.';
      grid.appendChild(empty);
      return;
    }

    // Har matching venue ke liye ek <article> card banao aur grid mein daalo
    filtered.forEach(function(v){
      var card = document.createElement('article');
      card.className = 'venue-card';
      card.innerHTML =
        '<div class="venue-art" style="background:' + artGradient(v.type) + '">' +
          '<span class="stamp">' + v.type + '</span>' +
        '</div>' +
        '<div class="venue-body">' +
          '<h3>' + v.name + '</h3>' +
          '<p class="venue-city">' + v.city + '</p>' +
          '<div class="venue-tags">' +
            '<span class="tag">' + v.capacity + ' cap</span>' +
            '<span class="tag">$' + v.price.toLocaleString() + '/day</span>' +
          '</div>' +
          '<div class="ticket-divider"></div>' +
          '<div class="venue-foot">' +
            '<span class="price mono">from <strong>$' + v.price.toLocaleString() + '</strong></span>' +
            // data-id attribute mein venue ka id chhupa dete hain, taaki
            // baad mein click hone par pata chal jaaye kaunsa venue tha
            '<button class="view-btn" data-id="' + v.id + '">View details</button>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);
    });
  }

  // Jab bhi search box mein type ho, ya kisi dropdown ki value badle,
  // renderGrid() dobara chala do
  [searchInput, cityFilter, typeFilter, capFilter].forEach(function(el){
    el.addEventListener('input', renderGrid);
    el.addEventListener('change', renderGrid);
  });
  // Filter form ka default "submit" (jo page reload kar deta hai) rok dete hain,
  // kyunki hume yahan real page-reload nahi chahiye
  document.getElementById('filterForm').addEventListener('submit', function(e){ e.preventDefault(); });

  /* --------------------------------------------------------------------
     STEP 5: MODAL (venue details popup)
     -------------------------------------------------------------------- */
  var backdrop = document.getElementById('modalBackdrop');
  var panel = document.getElementById('modalPanel');
  var modalTitle = document.getElementById('modalTitle');
  var modalCity = document.getElementById('modalCity');
  var modalGrid = document.getElementById('modalGrid');
  var modalDesc = document.getElementById('modalDesc');
  var modalConfirm = document.getElementById('modalConfirm');
  var currentVenue = null;   // abhi modal mein kaunsa venue dikh raha hai
  var lastFocused = null;    // modal khulne se pehle keyboard focus kahan tha (band karne par wapas wahin le jaane ke liye)

  // Modal ko ek specific venue ke data se bhar kar khol deta hai
  function openModal(venue){
    currentVenue = venue;
    modalTitle.textContent = venue.name;
    modalCity.textContent = venue.city + ' · ' + venue.type;
    modalGrid.innerHTML =
      '<div><div class="k">Capacity</div><div class="v">' + venue.capacity + ' guests</div></div>' +
      '<div><div class="k">Day rate</div><div class="v">$' + venue.price.toLocaleString() + '</div></div>' +
      '<div><div class="k">Amenities</div><div class="v">' + venue.amenities.slice(0,2).join(', ') + '</div></div>' +
      '<div><div class="k">Also included</div><div class="v">' + venue.amenities.slice(2).join(', ') + '</div></div>';
    modalDesc.textContent = venue.desc;
    modalConfirm.classList.remove('show');
    modalConfirm.textContent = '';

    lastFocused = document.activeElement;      // yaad rakho abhi focus kahan tha
    backdrop.classList.add('open');             // CSS "open" class se modal visible ho jaata hai
    document.getElementById('modalCloseBtn').focus(); // accessibility: focus modal ke andar le jao
    document.addEventListener('keydown', onKeydown);  // ab Escape/Tab key sunna shuru karo
  }

  function closeModal(){
    backdrop.classList.remove('open');
    document.removeEventListener('keydown', onKeydown);
    if(lastFocused) lastFocused.focus();   // wapas wahin focus le jao jahan se modal khola tha
  }

  // Keyboard accessibility: Escape se band, aur Tab se focus modal ke
  // andar hi "trap" rehta hai (bahar ke elements par nahi jaata jab tak
  // modal khula hai)
  function onKeydown(e){
    if(e.key === 'Escape'){ closeModal(); return; }
    if(e.key === 'Tab'){
      var focusable = panel.querySelectorAll('button, [href], input, select, textarea');
      if(!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  }

  // "Event delegation": har card par alag se click listener lagane ke
  // bajaye, poore grid par ek hi listener lagate hain. Jab bhi click ho,
  // check karte hain ki click ".view-btn" par hua ya nahi.
  // Fayda: dynamically bane naye cards par bhi yeh automatically kaam karega.
  grid.addEventListener('click', function(e){
    var btn = e.target.closest('.view-btn');
    if(!btn) return; // agar view-btn par click nahi hua, kuch mat karo
    var venue = venues.find(function(v){ return v.id === parseInt(btn.dataset.id, 10); });
    if(venue) openModal(venue);
  });

  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  // Agar user modal ke bahar wale dark overlay par click kare, tab bhi band ho jaaye
  backdrop.addEventListener('click', function(e){ if(e.target === backdrop) closeModal(); });

  // "Reserve this venue" button - ek confirmation message dikhata hai
  // aur planner form mein wahi venue pre-select kar deta hai
  document.getElementById('modalReserveBtn').addEventListener('click', function(){
    modalConfirm.textContent = 'Held for you — ' + currentVenue.name + ' is reserved pending confirmation. A planner slot has been pre-filled below.';
    modalConfirm.classList.add('show');
    evVenueSelect.value = currentVenue.id;
  });

  // "Plan event here" button - modal band karke seedha "Organize" section
  // mein le jaata hai, us venue ko pehle se select karke
  document.getElementById('modalPlanBtn').addEventListener('click', function(){
    evVenueSelect.value = currentVenue.id;
    closeModal();
    document.getElementById('evName').focus();
    document.getElementById('organize').scrollIntoView({behavior:'smooth', block:'start'});
  });

  /* --------------------------------------------------------------------
     STEP 6: EVENT PLANNER (form + list)
     User yahan apna event ka naam, date, guests, venue daal kar
     "Add" karta hai, aur ek list ban jaati hai (sirf memory mein,
     page refresh hote hi yeh list khaali ho jaayegi).
     -------------------------------------------------------------------- */
  var eventForm = document.getElementById('eventForm');
  var eventList = document.getElementById('eventList');
  var noEvents = document.getElementById('noEvents');
  var formStatus = document.getElementById('formStatus');
  var myEvents = [];   // yahan user ke saare added events store hote hain
  var evCounter = 0;   // har event ko unique id dene ke liye counter

  // myEvents array ke hisaab se list (<ul>) ko dobara banata hai
  function renderEvents(){
    eventList.innerHTML = '';
    noEvents.style.display = myEvents.length ? 'none' : 'block';
    myEvents.forEach(function(ev){
      var li = document.createElement('li');
      // venue id se venue ka naam dhoondna
      var venueName = ev.venueId ? (venues.find(function(v){return v.id === parseInt(ev.venueId,10);}) || {}).name : 'No venue selected';
      li.innerHTML =
        '<div>' +
          '<div class="ev-name">' + ev.name + '</div>' +
          '<div class="ev-meta">' + (ev.date || 'No date') + ' · ' + ev.guests + ' guests · ' + venueName + '</div>' +
        '</div>' +
        '<button class="remove" data-id="' + ev.uid + '" aria-label="Remove ' + ev.name + '">Remove</button>';
      eventList.appendChild(li);
    });
  }

  // Form submit hone par (yaani "Add to my events" button dabane par)
  eventForm.addEventListener('submit', function(e){
    e.preventDefault(); // page ko reload hone se rokte hain

    var name = document.getElementById('evName').value.trim();
    var date = document.getElementById('evDate').value;
    var guests = document.getElementById('evGuests').value;
    var venueId = document.getElementById('evVenue').value;
    var notes = document.getElementById('evNotes').value.trim();

    // Basic validation: zaroori fields khaali nahi honi chahiye
    if(!name || !guests || !venueId){
      formStatus.textContent = 'Add an event name, guest count, and venue before saving.';
      return;
    }

    evCounter++;
    myEvents.push({ uid: evCounter, name:name, date:date, guests:guests, venueId:venueId, notes:notes });
    renderEvents();
    formStatus.textContent = '"' + name + '" added to your events.';
    eventForm.reset(); // form ko khaali kar do agli entry ke liye

    // 4 second baad success message hata do
    setTimeout(function(){ formStatus.textContent = ''; }, 4000);
  });

  // "Remove" button ke liye bhi event delegation use kar rahe hain
  eventList.addEventListener('click', function(e){
    var btn = e.target.closest('.remove');
    if(!btn) return;
    var uid = parseInt(btn.dataset.id, 10);
    myEvents = myEvents.filter(function(ev){ return ev.uid !== uid; }); // us event ko array se hata do
    renderEvents();
  });

  /* --------------------------------------------------------------------
     STEP 7: MOBILE HAMBURGER MENU
     -------------------------------------------------------------------- */
  var navRow = document.getElementById('navRow');
  var hamburgerBtn = document.getElementById('hamburgerBtn');
  hamburgerBtn.addEventListener('click', function(){
    var isOpen = navRow.classList.toggle('menu-open'); // class add/remove toggle hoti hai
    hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false'); // accessibility ke liye state batate hain
  });
  // Jab user kisi nav link par click kare, mobile menu apne aap band ho jaaye
  document.querySelectorAll('nav.primary a').forEach(function(link){
    link.addEventListener('click', function(){
      navRow.classList.remove('menu-open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    });
  });

  /* --------------------------------------------------------------------
     STEP 8: INIT — Page load hote hi yeh 3 functions chal jaate hain
     -------------------------------------------------------------------- */
  populateFilters();  // dropdowns bharo
  renderGrid();        // venue cards dikhao
  renderEvents();       // event list dikhao (abhi khaali hogi)
})();
