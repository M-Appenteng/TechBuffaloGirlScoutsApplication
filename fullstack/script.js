// script.js


// Supabase setup
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-public-key";


const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// Main elements from index.html
const appViewport = document.getElementById("app-viewport");
const mainFooter = document.getElementById("main-footer");
const navTabs = document.querySelectorAll(".nav-tab");


// Demo user — no real login needed
let currentUser = {
 id: 1,
 name: "Demo Volunteer",
 email: "demo@girlscouts.org"
};


// Start app immediately in demo mode
document.addEventListener("DOMContentLoaded", () => {
 showApp();
});


// Show main app
function showApp() {
 mainFooter.classList.remove("hidden");
 loadExploreView();
}


// Explore page
function loadExploreView() {
 setActiveTab("views/explore.html");


 appViewport.innerHTML = `
   <section class="screen">
     <h1>Explore Events</h1>
     <p>Search by ZIP code to find available school events near you.</p>


     <div class="search-box">
       <input id="zip-input" type="text" placeholder="Enter ZIP code" />
       <button id="search-btn">Search</button>
     </div>


     <p id="status-message"></p>
     <div id="events-list"></div>
   </section>
 `;


 document
   .getElementById("search-btn")
   .addEventListener("click", handleZipSearch);
}


// Search unclaimed events by ZIP
async function handleZipSearch() {
 const zipCode = document.getElementById("zip-input").value.trim();
 const statusMessage = document.getElementById("status-message");
 const eventsList = document.getElementById("events-list");


 statusMessage.textContent = "";
 eventsList.innerHTML = "";


 if (!zipCode) {
   statusMessage.textContent = "Please enter a ZIP code.";
   return;
 }


 statusMessage.textContent = "Loading events...";


 const { data: events, error } = await supabaseClient
   .from("EVENT")
   .select("*")
   .eq("zip_code", zipCode)
   .is("volunteer_id", null);


 if (error) {
   statusMessage.textContent = error.message;
   return;
 }


 if (!events || events.length === 0) {
   statusMessage.textContent = "No available events found for this ZIP code.";
   return;
 }


 statusMessage.textContent = "";
 renderEvents(events, zipCode);
}


// Display event cards
function renderEvents(events, zipCode) {
 const eventsList = document.getElementById("events-list");


 eventsList.innerHTML = events
   .map(
     (event) => `
       <article class="event-card">
         <h2>${event.type_of_event || "School Event"}</h2>
         <p><strong>Date:</strong> ${event.day_of_week || ""} ${event.date_of_event || "TBD"}</p>
         <p><strong>Time:</strong> ${event.time_of_event || "TBD"}</p>
         <p><strong>ZIP:</strong> ${event.zip_code || zipCode}</p>
         <p><strong>Notes:</strong> ${event.notes || "No notes provided."}</p>


         <button class="commit-btn" data-event-id="${event.event_id}" data-zip="${zipCode}">
           Commit
         </button>
       </article>
     `
   )
   .join("");


 document.querySelectorAll(".commit-btn").forEach((button) => {
   button.addEventListener("click", handleCommit);
 });
}


// Claim event
async function handleCommit(e) {
 const button = e.currentTarget;
 const eventId = button.getAttribute("data-event-id");


 button.disabled = true;
 button.textContent = "Claiming...";


 const volunteerId = currentUser.id;


 const { data, error } = await supabaseClient
   .from("EVENT")
   .update({ volunteer_id: volunteerId })
   .eq("event_id", eventId)
   .is("volunteer_id", null)
   .select();


 if (error) {
   alert(error.message);
   button.disabled = false;
   button.textContent = "Commit";
   return;
 }


 if (!data || data.length === 0) {
   alert("Sorry, this event was already claimed.");
   button.closest(".event-card").remove();
   return;
 }


 alert("Event claimed!");
 button.closest(".event-card").remove();
}


// Upcoming page
async function loadUpcomingView() {
 setActiveTab("views/upcoming.html");


 appViewport.innerHTML = `
   <section class="screen">
     <h1>Upcoming Shifts</h1>
     <p id="status-message">Loading your claimed events...</p>
     <div id="events-list"></div>
   </section>
 `;


 const { data: events, error } = await supabaseClient
   .from("EVENT")
   .select("*")
   .eq("volunteer_id", currentUser.id);


 const statusMessage = document.getElementById("status-message");
 const eventsList = document.getElementById("events-list");


 if (error) {
   statusMessage.textContent = error.message;
   return;
 }


 if (!events || events.length === 0) {
   statusMessage.textContent = "You have not claimed any events yet.";
   return;
 }


 statusMessage.textContent = "";


 eventsList.innerHTML = events
   .map(
     (event) => `
       <article class="event-card">
         <h2>${event.type_of_event || "School Event"}</h2>
         <p><strong>Date:</strong> ${event.day_of_week || ""} ${event.date_of_event || "TBD"}</p>
         <p><strong>Time:</strong> ${event.time_of_event || "TBD"}</p>
         <p><strong>ZIP:</strong> ${event.zip_code || "N/A"}</p>
         <p><strong>Notes:</strong> ${event.notes || "No notes provided."}</p>
       </article>
     `
   )
   .join("");
}


// Past page placeholder
function loadPastView() {
 setActiveTab("views/past.html");


 appViewport.innerHTML = `
   <section class="screen">
     <h1>Past Events</h1>
     <p>Past volunteer history will appear here.</p>
   </section>
 `;
}


// Account page
function loadAccountView() {
 setActiveTab("views/account.html");


 appViewport.innerHTML = `
   <section class="screen">
     <h1>Account</h1>
     <p><strong>Name:</strong> ${currentUser.name}</p>
     <p><strong>Email:</strong> ${currentUser.email}</p>
     <p><strong>Volunteer ID:</strong> ${currentUser.id}</p>
     <button id="logout-btn">Restart Demo</button>
   </section>
 `;


 document.getElementById("logout-btn").addEventListener("click", () => {
   location.reload();
 });
}


// Footer navigation
navTabs.forEach((tab) => {
 tab.addEventListener("click", () => {
   const view = tab.getAttribute("data-view");


   if (view === "views/explore.html") {
     loadExploreView();
   } else if (view === "views/upcoming.html") {
     loadUpcomingView();
   } else if (view === "views/past.html") {
     loadPastView();
   } else if (view === "views/account.html") {
     loadAccountView();
   }
 });
});


// Active tab styling
function setActiveTab(view) {
 navTabs.forEach((tab) => {
   tab.classList.toggle("active", tab.getAttribute("data-view") === view);
 });
}

