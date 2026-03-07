<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SCAT CMS | Courses Enrolled</title>
  <link rel="stylesheet" href="prof-attendance.css" />
</head>
<body>

<div class="layout">
  <!-- SIDEBAR (UNCHANGED STRUCTURE) -->
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
    <div class="sheetCard">

      <div class="topLine">
        <div class="pageTitle" id="pageTitle">Courses</div>
      </div>

      <div class="tableShell">
        <table class="schedTable">
          <thead>
            <tr>
              <th>PROGRAM</th>
              <th>YEAR</th>
              <th>SECTION</th>
              <th>STUDENTS</th>
              <th class="colArrow"></th>
            </tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>

        <div id="emptyBox" class="emptyBox" style="display:none;">No courses found.</div>
      </div>

    </div>
  </main>
</div>

<script src="prof-attendance.js"></script>
</body>
</html>