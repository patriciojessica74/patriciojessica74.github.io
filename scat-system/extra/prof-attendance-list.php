<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SCAT CMS | Attendance List</title>
  <link rel="stylesheet" href="prof-attendance-list.css" />
</head>
<body>

<div class="layout">
  <!-- SIDEBAR (keep your style) -->
  <aside class="sidebar">
    <div class="logoBox">
      <img src="image/scatlogo.png" alt="SCAT CMS" class="logo">
    </div>

    <nav class="menu">
      <a class="menuItem" href="prof-dashboard.php">Dashboard</a>
      <a class="menuItem" href="prof-schedule.php">Schedule</a>
      <a class="menuItem active" href="prof-attendance.php">Attendance Tracking</a>
      <a class="menuItem" href="prof-profile.php">Profile</a>
    </nav>

    <div class="logoutWrap">
      <button id="logoutBtn" class="logoutBtn">Logout</button>
    </div>
  </aside>

  <!-- MAIN -->
  <main class="main">
    <div class="attWrap">
      <h1 class="bigTitle" id="courseTitle">—</h1>

      <!-- Subject bar -->
      <div class="subjectBar">
        <div class="subjectLeft" id="subjectLine">—</div>

        <div class="subjectRight">
          <div class="meta">
            <span class="icon">📅</span>
            <span id="dayText">—</span>
          </div>
          <div class="meta">
            <span class="icon">🕒</span>
            <span id="timeText">—</span>
          </div>
        </div>
      </div>

      <!-- Table card -->
      <table class="schedTable">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Program</th>
            <th>Year</th>
            <th>Section</th>
            <th>Time in</th>
            <th>Note</th>
            <th>Record</th>

          </tr>
        </thead>
        <tbody id="tbodyStudents"></tbody>
      </table>

      <div id="emptyBox" class="emptyBox" style="display:none;">
        No enrolled students found.
      </div>

    </div>
  </main>
</div>

<script src="prof-attendance-list.js"></script>
</body>
</html>