<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SCAT CMS | Student List</title>
  <link rel="stylesheet" href="prof-schedule.css" />
</head>
<body>

<div class="layout">
  <!-- SIDEBAR (KEEP YOURS) -->
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

  <main class="main">
    <div class="sheetCard">

      <div class="topLine">
        <div class="pageTitle" id="pageTitle">Students</div>
      </div>

      <div class="tableShell">
        <table class="schedTable">
          <thead>
            <tr>
              <th>STUDENT NAME</th>
              <th>STUDENT ID</th>
              <th>EMAIL</th>
            </tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>

        <div id="emptyBox" class="emptyBox" style="display:none;">No students found.</div>
      </div>
      <div style="margin-top:18px; display:flex; justify-content:flex-start;">
        <button id="backBtn" class="backBtn">← Back</button>
      </div>

    </div>
  </main>
</div>

<script src="prof-student-list.js"></script>
</body>
</html>