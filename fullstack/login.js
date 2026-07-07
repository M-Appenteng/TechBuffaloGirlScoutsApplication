// 1. Initialize Supabase Client
// Replace these placeholders with your actual keys from your Supabase Dashboard settings
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = "your-actual-anon-public-key";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. DOM Elements Selection
const loginForm = document.getElementById('login-form');
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const userDisplayEmail = document.getElementById('user-display-email');
const errorMessage = document.getElementById('error-message');
const logoutBtn = document.getElementById('logout-btn');

// 3. Handle Login Submit Event
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop page refresh
    errorMessage.textContent = ""; // Clear old errors

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Contact Supabase to verify credentials
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        errorMessage.textContent = error.message;
    } else {
        // Success! Transition UI states
        showDashboard(data.user);
    }
});

// 4. Handle Logout Event
logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
    showLogin();
});

// 5. UI Layout Toggles
function showDashboard(user) {
    loginContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    // Adapt overall body layout rule for dashboard view
    document.body.style.alignItems = "stretch";
    
    userDisplayEmail.textContent = `Logged in as: ${user.email}`;
}

function showLogin() {
    dashboardContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    document.body.style.alignItems = "center";
    loginForm.reset();
}

// Initialize Supabase (Use your actual credentials here)
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = "your-actual-anon-public-key";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const appContent = document.getElementById('app-content');
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

// --- SCREEN DEFINITIONS (Data to map out your screens) ---
const screens = {
    home: `
        <h1 class="page-title">Volunteer Dashboard</h1>
        <p>Welcome to your central portal! Choose an option from the menu below to get started or review notifications.</p>
    `,
    upcoming: `
        <h1 class="page-title">Upcoming Shifts</h1>
        <p>No shifts assigned for this week. Check back later!</p>
    `,
    past: `
        <h1 class="page-title">Past History</h1>
        <p>Thank you for your service! Here are your recorded entries.</p>
    `,
    account: `
        <h1 class="page-title">My Account</h1>
        <button id="logout-btn" class="btn" style="background:#dc2626; margin-top:2rem;">Log Out</button>
    `
};

// --- AUTH STATE PERSISTENCE CHECK ---
// Automatically check if user is already logged in when app boots up
async function checkUserSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showApp();
    }
}
checkUserSession();

// Form handler for Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.textContent = "";
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        errorMessage.textContent = error.message;
    } else {
        showApp();
    }
});

// Transition to App Environment
function showApp() {
    loginContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    navigateToScreen('home'); // Defaults to Home Dashboard view first
}

// --- NAVIGATION LOGIC ---
function navigateToScreen(screenKey) {
    // Injects the raw layout view code directly into our main block
    appContent.innerHTML = screens[screenKey];
    
    // Wire up the dynamic logout button specifically if we step into the account screen
    if (screenKey === 'account') {
        document.getElementById('logout-btn').addEventListener('click', async () => {
            await supabase.auth.signOut();
            location.reload(); // Hard resets app states back to default login view safely
        });
    }
}

// Add event listeners to all permanent footer navigation tabs
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        const targetTab = e.currentTarget;
        
        // Remove active blue state color from previous tab selection
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        
        // Mark current button clicked as blue/active
        targetTab.classList.add('active');
        
        // Grab the screen data-target profile property and display it
        const targetScreen = targetTab.getAttribute('data-target');
        navigateToScreen(targetScreen);
    });
});