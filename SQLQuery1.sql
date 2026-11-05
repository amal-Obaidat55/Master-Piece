CREATE DATABASE SpeakUpAI;
GO
USE SpeakUpAI;
GO

CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(500) NOT NULL, 
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Role VARCHAR(20) NOT NULL CHECK (Role IN ('job_seeker','employer','expert','admin')),
    Phone VARCHAR(40) NULL,
    AvatarUrl VARCHAR(1000) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE JobSeekerProfiles (
    UserId INT PRIMARY KEY REFERENCES Users(UserId) ON DELETE CASCADE,
    Headline VARCHAR(200) NULL,
    Location VARCHAR(150) NULL,
    Summary VARCHAR(MAX) NULL,
    YearsExperience DECIMAL(4,1) NULL,
    LinkedInUrl VARCHAR(500) NULL,
    PortfolioUrl VARCHAR(500) NULL,
    DesiredRole VARCHAR(150) NULL,
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Companies (
    CompanyId INT IDENTITY(1,1) PRIMARY KEY,
    OwnerUserId INT NOT NULL REFERENCES Users(UserId),
    Name VARCHAR(200) NOT NULL,
    Industry VARCHAR(120) NULL,
    Website VARCHAR(500) NULL,
    Location VARCHAR(150) NULL,
    Description VARCHAR(MAX) NULL,
    LogoUrl VARCHAR(1000) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE ExpertProfiles (
    UserId INT PRIMARY KEY REFERENCES Users(UserId) ON DELETE CASCADE,
    Headline VARCHAR(200) NULL,
    Bio VARCHAR(MAX) NULL,
    Organization VARCHAR(200) NULL,
    Location VARCHAR(150) NULL,
    YearsExperience INT NULL,
    HourlyRate DECIMAL(10,2) NULL,
    Currency VARCHAR(3) NOT NULL DEFAULT 'JD',
    IsListed BIT NOT NULL DEFAULT 1
);

CREATE TABLE ExpertSpecialties (
    ExpertUserId INT NOT NULL REFERENCES ExpertProfiles(UserId) ON DELETE CASCADE,
    Specialty VARCHAR(120) NOT NULL,
    PRIMARY KEY (ExpertUserId, Specialty)
);

CREATE TABLE Jobs (
    JobId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT NOT NULL REFERENCES Companies(CompanyId),
    PostedByUserId INT NOT NULL REFERENCES Users(UserId),
    Title VARCHAR(200) NOT NULL,
    Description VARCHAR(MAX) NOT NULL,
    Location VARCHAR(150) NULL,
    EmploymentType VARCHAR(30) NULL,
    WorkplaceType VARCHAR(30) NULL,
    SalaryMin DECIMAL(12,2) NULL,
    SalaryMax DECIMAL(12,2) NULL,
    Currency VARCHAR(3) NOT NULL DEFAULT 'JD',
    Status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (Status IN ('draft','open','paused','closed','removed')),
    PostedAt DATETIME2 NULL,
    ExpiresAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Skills (
    SkillId INT IDENTITY(1,1) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE UserSkills (
    UserId INT NOT NULL REFERENCES JobSeekerProfiles(UserId) ON DELETE CASCADE,
    SkillId INT NOT NULL REFERENCES Skills(SkillId),
    Proficiency VARCHAR(20) NULL,
    YearsExperience DECIMAL(4,1) NULL,
    PRIMARY KEY (UserId, SkillId)
);

CREATE TABLE JobSkills (
    JobId INT NOT NULL REFERENCES Jobs(JobId) ON DELETE CASCADE,
    SkillId INT NOT NULL REFERENCES Skills(SkillId),
    IsRequired BIT NOT NULL DEFAULT 1,
    PRIMARY KEY (JobId, SkillId)
);

CREATE TABLE Resumes (
    ResumeId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL REFERENCES JobSeekerProfiles(UserId) ON DELETE CASCADE,
    FileName VARCHAR(260) NOT NULL,
    FileUrl VARCHAR(1000) NULL,
    ExtractedText VARCHAR(MAX) NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    UploadedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE CVAnalyses (
    CVAnalysisId INT IDENTITY(1,1) PRIMARY KEY,
    ResumeId INT NOT NULL REFERENCES Resumes(ResumeId) ON DELETE CASCADE,
    TargetJobId INT NULL REFERENCES Jobs(JobId),
    OverallScore DECIMAL(5,2) NULL,
    FindingsJson VARCHAR(MAX) NULL,
    RecommendationsJson VARCHAR(MAX) NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (Status IN ('queued','processing','completed','failed')),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE SavedJobs (
    UserId INT NOT NULL REFERENCES JobSeekerProfiles(UserId) ON DELETE CASCADE,
    JobId INT NOT NULL REFERENCES Jobs(JobId) ON DELETE CASCADE,
    SavedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (UserId, JobId)
);

CREATE TABLE JobApplications (
    ApplicationId INT IDENTITY(1,1) PRIMARY KEY,
    JobId INT NOT NULL REFERENCES Jobs(JobId),
    CandidateUserId INT NOT NULL REFERENCES JobSeekerProfiles(UserId),
    ResumeId INT NULL REFERENCES Resumes(ResumeId),
    Status VARCHAR(20) NOT NULL DEFAULT 'applied' CHECK (Status IN ('applied','screening','interview','offer','hired','rejected','withdrawn')),
    MatchScore DECIMAL(5,2) NULL,
    CoverLetter VARCHAR(MAX) NULL,
    EmployerNotes VARCHAR(MAX) NULL,
    AppliedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_JobApplications_Job_Candidate UNIQUE (JobId, CandidateUserId)
);

CREATE TABLE ApplicationStageHistory (
    StageHistoryId INT IDENTITY(1,1) PRIMARY KEY,
    ApplicationId INT NOT NULL REFERENCES JobApplications(ApplicationId) ON DELETE CASCADE,
    ChangedByUserId INT NULL REFERENCES Users(UserId),
    OldStatus VARCHAR(20) NULL,
    NewStatus VARCHAR(20) NOT NULL,
    Note VARCHAR(1000) NULL,
    ChangedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE InterviewSessions (
    InterviewId INT IDENTITY(1,1) PRIMARY KEY,
    CandidateUserId INT NOT NULL REFERENCES JobSeekerProfiles(UserId),
    JobId INT NULL REFERENCES Jobs(JobId),
    ApplicationId INT NULL REFERENCES JobApplications(ApplicationId),
    Title VARCHAR(200) NOT NULL,
    InterviewType VARCHAR(30) NOT NULL DEFAULT 'general' CHECK (InterviewType IN ('general','technical','behavioral','job_specific')),
    Status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (Status IN ('scheduled','in_progress','processing','completed','cancelled','failed')),
    ScheduledAt DATETIME2 NULL,
    StartedAt DATETIME2 NULL,
    CompletedAt DATETIME2 NULL,
    DurationMinutes INT NULL,
    OverallScore DECIMAL(5,2) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE InterviewQuestions (
    QuestionId INT IDENTITY(1,1) PRIMARY KEY,
    QuestionText VARCHAR(MAX) NOT NULL,
    Category VARCHAR(100) NULL,
    InterviewType VARCHAR(30) NULL,
    Difficulty VARCHAR(20) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedByUserId INT NULL REFERENCES Users(UserId),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE InterviewAnswers (
    AnswerId INT IDENTITY(1,1) PRIMARY KEY,
    InterviewId INT NOT NULL REFERENCES InterviewSessions(InterviewId) ON DELETE CASCADE,
    QuestionId INT NULL REFERENCES InterviewQuestions(QuestionId),
    QuestionText VARCHAR(MAX) NOT NULL,
    AnswerText VARCHAR(MAX) NULL,
    RecordingUrl VARCHAR(1000) NULL,
    AnsweredAt DATETIME2 NULL,
    Score DECIMAL(5,2) NULL,
    Feedback VARCHAR(MAX) NULL,
    StarSituation VARCHAR(MAX) NULL,
    StarTask VARCHAR(MAX) NULL,
    StarAction VARCHAR(MAX) NULL,
    StarResult VARCHAR(MAX) NULL
);

CREATE TABLE InterviewScoreBreakdown (
    ScoreBreakdownId INT IDENTITY(1,1) PRIMARY KEY,
    InterviewId INT NOT NULL REFERENCES InterviewSessions(InterviewId) ON DELETE CASCADE,
    Criterion VARCHAR(100) NOT NULL,
    Score DECIMAL(5,2) NOT NULL,
    Feedback VARCHAR(MAX) NULL,
    CONSTRAINT UQ_InterviewScoreBreakdown UNIQUE (InterviewId, Criterion)
);

CREATE TABLE InterviewReports (
    ReportId INT IDENTITY(1,1) PRIMARY KEY,
    InterviewId INT NOT NULL UNIQUE REFERENCES InterviewSessions(InterviewId) ON DELETE CASCADE,
    Summary VARCHAR(MAX) NULL,
    StrengthsJson VARCHAR(MAX) NULL,
    ImprovementsJson VARCHAR(MAX) NULL,
    RecommendationsJson VARCHAR(MAX) NULL,
    GeneratedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE TrainingPlanItems (
    PlanItemId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL REFERENCES JobSeekerProfiles(UserId) ON DELETE CASCADE,
    SourceInterviewId INT NULL REFERENCES InterviewSessions(InterviewId),
    Title VARCHAR(200) NOT NULL,
    Description VARCHAR(MAX) NULL,
    Category VARCHAR(100) NULL,
    DueDate DATE NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (Status IN ('not_started','in_progress','completed')),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE ExpertAvailability (
    AvailabilityId INT IDENTITY(1,1) PRIMARY KEY,
    ExpertUserId INT NOT NULL REFERENCES ExpertProfiles(UserId) ON DELETE CASCADE,
    DayOfWeek TINYINT NOT NULL CHECK (DayOfWeek BETWEEN 1 AND 7), -- ISO weekday Monday=1
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    TimeZone VARCHAR(80) NOT NULL DEFAULT 'Asia/Amman',
    IsActive BIT NOT NULL DEFAULT 1,
    CHECK (EndTime > StartTime)
);

CREATE TABLE ExpertBookings (
    BookingId INT IDENTITY(1,1) PRIMARY KEY,
    CandidateUserId INT NOT NULL REFERENCES JobSeekerProfiles(UserId),
    ExpertUserId INT NOT NULL REFERENCES ExpertProfiles(UserId),
    RelatedJobId INT NULL REFERENCES Jobs(JobId),
    Title VARCHAR(200) NOT NULL,
    StartsAt DATETIME2 NOT NULL,
    EndsAt DATETIME2 NOT NULL,
    MeetingUrl VARCHAR(1000) NULL,
    CandidateNotes VARCHAR(MAX) NULL,
    ExpertNotes VARCHAR(MAX) NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'booked' CHECK (Status IN ('booked','confirmed','completed','cancelled','no_show')),
    Price DECIMAL(10,2) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CHECK (EndsAt > StartsAt)
);

CREATE TABLE ExpertReviews (
    ReviewId INT IDENTITY(1,1) PRIMARY KEY,
    BookingId INT NOT NULL UNIQUE REFERENCES ExpertBookings(BookingId),
    CandidateUserId INT NOT NULL REFERENCES JobSeekerProfiles(UserId),
    ExpertUserId INT NOT NULL REFERENCES ExpertProfiles(UserId),
    Rating TINYINT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    ReviewText VARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Notifications (
    NotificationId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL REFERENCES Users(UserId) ON DELETE CASCADE,
    Title VARCHAR(200) NOT NULL,
    Message VARCHAR(MAX) NOT NULL,
    TargetUrl VARCHAR(1000) NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE UserSettings (
    UserId INT PRIMARY KEY REFERENCES Users(UserId) ON DELETE CASCADE,
    Theme VARCHAR(20) NOT NULL DEFAULT 'light',
    LanguageCode VARCHAR(10) NOT NULL DEFAULT 'en',
    EmailNotifications BIT NOT NULL DEFAULT 1,
    PushNotifications BIT NOT NULL DEFAULT 1,
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE InterviewOptions (
    OptionId INT IDENTITY(1,1) PRIMARY KEY,
    OptionType VARCHAR(50) NOT NULL,
    OptionValue VARCHAR(100) NOT NULL,
    DisplayLabel VARCHAR(150) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT UQ_InterviewOptions UNIQUE (OptionType, OptionValue)
);

CREATE TABLE ScoringCriteria (
    CriteriaId INT IDENTITY(1,1) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Description VARCHAR(500) NULL,
    Weight DECIMAL(5,2) NOT NULL DEFAULT 1,
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE TABLE ContentBlocks (
    ContentBlockId INT IDENTITY(1,1) PRIMARY KEY,
    AudienceRole VARCHAR(20) NULL CHECK (AudienceRole IS NULL OR AudienceRole IN ('job_seeker','employer','expert','admin')),
    ContentKey VARCHAR(100) NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Body VARCHAR(MAX) NOT NULL,
    IsPublished BIT NOT NULL DEFAULT 0,
    UpdatedByUserId INT NULL REFERENCES Users(UserId),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_ContentBlocks UNIQUE (AudienceRole, ContentKey)
);

CREATE TABLE PlatformSchedules (
    ScheduleId INT IDENTITY(1,1) PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description VARCHAR(MAX) NULL,
    StartsAt DATETIME2 NOT NULL,
    EndsAt DATETIME2 NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (Status IN ('scheduled','completed','cancelled')),
    CreatedByUserId INT NULL REFERENCES Users(UserId),
    CHECK (EndsAt > StartsAt)
);
GO

INSERT Users (Email, PasswordHash, FirstName, LastName, Role, Phone) VALUES
('amal.candidate@example.com', 'DEMO_HASH_REPLACE_WITH_REAL_PASSWORD_HASH', 'Amal', 'Obaidat', 'job_seeker', '+962790000001'),
('sara.hr@example.com', 'DEMO_HASH_REPLACE_WITH_REAL_PASSWORD_HASH', 'Sara', 'Khalil', 'employer', '+962790000002'),
('maya.expert@example.com', 'DEMO_HASH_REPLACE_WITH_REAL_PASSWORD_HASH', 'Maya', 'Chen', 'expert', '+962790000003'),
('admin@speakup.example.com', 'DEMO_HASH_REPLACE_WITH_REAL_PASSWORD_HASH', 'Platform', 'Admin', 'admin', '+962790000004'),
('omar.candidate@example.com', 'DEMO_HASH_REPLACE_WITH_REAL_PASSWORD_HASH', 'Omar', 'Nasser', 'job_seeker', '+962790000005');

INSERT JobSeekerProfiles (UserId, Headline, Location, Summary, YearsExperience, LinkedInUrl, PortfolioUrl, DesiredRole)
VALUES (1, 'Frontend Developer', 'Amman, Jordan', 'Frontend developer focused on accessible web apps and thoughtful user experiences.', 2.5, 'https://www.linkedin.com/in/amal-demo', 'https://amal-portfolio.example.com', 'Frontend Developer'),
       (5, 'Product Designer', 'Amman, Jordan', 'Product designer experienced in research, prototyping, and design systems.', 4.0, 'https://www.linkedin.com/in/omar-demo', NULL, 'Product Designer');

INSERT Companies (OwnerUserId, Name, Industry, Website, Location, Description)
VALUES (2, 'BrightPath Digital', 'Software', 'https://brightpath.example.com', 'Amman, Jordan', 'A product studio building practical digital services.');

INSERT ExpertProfiles (UserId, Headline, Bio, Organization, Location, YearsExperience, HourlyRate, Currency)
VALUES (3, 'Product design mentor', 'I help candidates tell clear stories about their design work and prepare for interviews.', 'Independent Mentor', 'Remote', 9, 45.00, 'JD');
INSERT ExpertSpecialties (ExpertUserId, Specialty) VALUES
(3, 'Portfolio review'), (3, 'Interview preparation'), (3, 'Product design');

INSERT Skills (Name) VALUES ('JavaScript'), ('React'), ('Accessibility'), ('Figma'), ('User Research');
INSERT UserSkills (UserId, SkillId, Proficiency, YearsExperience) VALUES
(1, 1, 'Advanced', 2.5), (1, 2, 'Advanced', 2.0), (1, 3, 'Intermediate', 1.5),
(5, 4, 'Advanced', 4.0), (5, 5, 'Advanced', 3.0);

INSERT Jobs (CompanyId, PostedByUserId, Title, Description, Location, EmploymentType, WorkplaceType, SalaryMin, SalaryMax, Currency, Status, PostedAt)
VALUES (1, 2, 'Frontend Developer', 'Build accessible React interfaces, collaborate with product design, and improve the web application.', 'Amman, Jordan', 'full_time', 'hybrid', 1200, 1800, 'JD', 'open', '2026-10-20T09:00:00'),
       (1, 2, 'Product Designer', 'Lead product discovery, prototyping, and design system improvements with a cross-functional team.', 'Amman, Jordan', 'full_time', 'hybrid', 1300, 2000, 'JD', 'open', '2026-10-25T09:00:00');
INSERT JobSkills (JobId, SkillId, IsRequired) VALUES (1,1,1),(1,2,1),(1,3,0),(2,4,1),(2,5,1);

INSERT Resumes (UserId, FileName, FileUrl, ExtractedText, IsPrimary, UploadedAt)
VALUES (1, 'Amal_Obaidat_CV.pdf', '/demo/resumes/amal-cv.pdf', 'Frontend developer with experience in React, JavaScript, and accessibility.', 1, '2026-10-28T10:00:00'),
       (5, 'Omar_Nasser_CV.pdf', '/demo/resumes/omar-cv.pdf', 'Product designer with experience in Figma, research, and design systems.', 1, '2026-10-29T10:00:00');

INSERT CVAnalyses (ResumeId, TargetJobId, OverallScore, FindingsJson, RecommendationsJson, Status, CreatedAt)
VALUES (1, 1, 82.00, '{"strengths":["React experience","Clear project impact"],"gaps":["Add measurable outcomes"]}', '["Quantify performance improvements","Add an accessibility project example"]', 'completed', '2026-10-28T10:15:00');

INSERT SavedJobs (UserId, JobId, SavedAt) VALUES (1, 2, '2026-10-30T11:00:00');


INSERT JobApplications (JobId, CandidateUserId, ResumeId, Status, MatchScore, CoverLetter, AppliedAt)
VALUES (1, 1, 1, 'interview', 92.00, 'I enjoy building accessible interfaces and would love to contribute to your product.', '2026-10-30T12:00:00'),
       (2, 5, 2, 'screening', 87.00, 'My product design experience aligns closely with your team needs.', '2026-10-31T09:30:00');
INSERT ApplicationStageHistory (ApplicationId, ChangedByUserId, OldStatus, NewStatus, Note, ChangedAt)
VALUES (1, 2, 'applied', 'screening', 'Application reviewed by the hiring team.', '2026-10-31T14:00:00'),
       (1, 2, 'screening', 'interview', 'Invite candidate to an interview.', '2026-11-01T10:00:00'),
       (2, 2, 'applied', 'screening', 'Profile shortlisted for review.', '2026-11-01T11:00:00');

INSERT InterviewQuestions (QuestionText, Category, InterviewType, Difficulty, IsActive, CreatedByUserId)
VALUES ('Tell me about a frontend project where you improved the user experience.', 'Project experience', 'behavioral', 'medium', 1, 4),
       ('How do you make a React interface accessible?', 'Accessibility', 'technical', 'medium', 1, 4);

INSERT InterviewSessions (CandidateUserId, JobId, ApplicationId, Title, InterviewType, Status, StartedAt, CompletedAt, DurationMinutes, OverallScore, CreatedAt)
VALUES (1, 1, 1, 'Frontend Developer Practice', 'job_specific', 'completed', '2026-11-01T15:00:00', '2026-11-01T15:24:00', 24, 82.00, '2026-11-01T14:55:00');

INSERT InterviewAnswers (InterviewId, QuestionId, QuestionText, AnswerText, AnsweredAt, Score, Feedback, StarSituation, StarTask, StarAction, StarResult)
VALUES (1, 1, 'Tell me about a frontend project where you improved the user experience.', 'I improved the onboarding flow by testing it with users and reducing unnecessary steps.', '2026-11-01T15:08:00', 84.00, 'Clear example; add a measurable result.', 'Users abandoned onboarding.', 'Make the first session easier.', 'Tested the flow and removed redundant steps.', 'More users completed setup.');

INSERT InterviewScoreBreakdown (InterviewId, Criterion, Score, Feedback) VALUES
(1, 'Communication', 85, 'Answers were clear and structured.'),
(1, 'Technical knowledge', 80, 'Good React and accessibility fundamentals.'),
(1, 'Confidence', 81, 'Maintain steady pacing and concise examples.');

INSERT InterviewReports (InterviewId, Summary, StrengthsJson, ImprovementsJson, RecommendationsJson)
VALUES (1, 'Strong practice interview with clear examples and solid technical fundamentals.', '["Clear communication","Relevant React experience"]', '["Add metrics to project stories","Tighten answer openings"]', '["Practice one accessibility example","Use STAR structure for behavioral answers"]');

INSERT TrainingPlanItems (UserId, SourceInterviewId, Title, Description, Category, DueDate, Status)
VALUES (1, 1, 'Add measurable outcomes to project stories', 'Rewrite two project examples with clear before-and-after results.', 'Communication', '2026-11-14', 'in_progress'),
       (1, 1, 'Practice accessibility interview questions', 'Prepare a concise example of applying keyboard and screen reader support.', 'Technical', '2026-11-18', 'not_started');

INSERT ExpertAvailability (ExpertUserId, DayOfWeek, StartTime, EndTime, TimeZone, IsActive)
VALUES (3, 2, '09:00', '13:00', 'Asia/Amman', 1), (3, 4, '14:00', '18:00', 'Asia/Amman', 1);

INSERT ExpertBookings (CandidateUserId, ExpertUserId, RelatedJobId, Title, StartsAt, EndsAt, MeetingUrl, CandidateNotes, ExpertNotes, Status, Price)
VALUES (1, 3, 1, 'Frontend interview preparation', '2026-11-20T10:00:00', '2026-11-20T11:00:00', 'https://meet.example.com/demo-session', 'Please focus on communicating project impact.', NULL, 'confirmed', 45.00);

INSERT Notifications (UserId, Title, Message, TargetUrl, IsRead, CreatedAt) VALUES
(1, 'Application update', 'Your application moved to the interview stage.', '../Job seeker/my-applications.html', 0, '2026-11-01T10:05:00'),
(2, 'New applicant', 'Amal Obaidat applied for Frontend Developer.', 'applicants.html', 0, '2026-10-30T12:01:00'),
(3, 'New booking', 'A candidate booked a coaching session.', 'expert-sessions.html', 0, '2026-11-02T08:00:00');

INSERT UserSettings (UserId, Theme, LanguageCode, EmailNotifications, PushNotifications) VALUES
(1, 'light', 'en', 1, 1), (2, 'dark', 'en', 1, 0), (3, 'light', 'en', 1, 1), (4, 'light', 'en', 1, 0), (5, 'light', 'en', 1, 1);

INSERT InterviewOptions (OptionType, OptionValue, DisplayLabel, SortOrder) VALUES
('duration', '15', '15 minutes', 1), ('duration', '30', '30 minutes', 2), ('duration', '45', '45 minutes', 3),
('interview_type', 'technical', 'Technical', 1), ('interview_type', 'behavioral', 'Behavioral', 2), ('interview_type', 'job_specific', 'Job specific', 3);

INSERT ScoringCriteria (Name, Description, Weight) VALUES
('Communication', 'Clarity, structure, and listening.', 1.00),
('Technical knowledge', 'Accuracy and depth of role-related knowledge.', 1.00),
('Confidence', 'Composure, pacing, and professional presence.', 1.00),
('Problem solving', 'Reasoning and approach to challenges.', 1.00);

INSERT ContentBlocks (AudienceRole, ContentKey, Title, Body, IsPublished, UpdatedByUserId)
VALUES ('job_seeker', 'welcome_tip', 'Welcome to SpeakUp', 'Practice at your pace and use feedback to prepare for your next interview.', 1, 4),
       ('employer', 'candidate_review_tip', 'Review candidates', 'Use consistent criteria when reviewing applications.', 1, 4);

INSERT PlatformSchedules (Title, Description, StartsAt, EndsAt, Status, CreatedByUserId)
VALUES ('Demo maintenance window', 'Sample admin schedule record.', '2026-12-01T22:00:00', '2026-12-01T23:00:00', 'scheduled', 4);
GO





INSERT Users (Email, PasswordHash, FirstName, LastName, Role, Phone) VALUES
('lina.candidate@example.com', 'DEMO_HASH_REPLACE_WITH_REAL_PASSWORD_HASH', 'Lina', 'Haddad', 'job_seeker', '+962790000006'),
('yazan.candidate@example.com', 'DEMO_HASH_REPLACE_WITH_REAL_PASSWORD_HASH', 'Yazan', 'Saleh', 'job_seeker', '+962790000007'),
('reem.hr@example.com', 'DEMO_HASH_REPLACE_WITH_REAL_PASSWORD_HASH', 'Reem', 'Mansour', 'employer', '+962790000008'),
('nour.expert@example.com', 'DEMO_HASH_REPLACE_WITH_REAL_PASSWORD_HASH', 'Nour', 'Ali', 'expert', '+962790000009'),
('sami.candidate@example.com', 'DEMO_HASH_REPLACE_WITH_REAL_PASSWORD_HASH', 'Sami', 'Khatib', 'job_seeker', '+962790000010'),
('dana.hr@example.com', 'DEMO_HASH_REPLACE_WITH_REAL_PASSWORD_HASH', 'Dana', 'Odeh', 'employer', '+962790000011'),
('tariq.expert@example.com', 'DEMO_HASH_REPLACE_WITH_REAL_PASSWORD_HASH', 'Tariq', 'Hussein', 'expert', '+962790000012'),
('admin2@speakup.example.com', 'DEMO_HASH_REPLACE_WITH_REAL_PASSWORD_HASH', 'Rana', 'Admin', 'admin', '+962790000013'),
('mira.candidate@example.com', 'DEMO_HASH_REPLACE_WITH_REAL_PASSWORD_HASH', 'Mira', 'Yousef', 'job_seeker', '+962790000014');

INSERT JobSeekerProfiles (UserId, Headline, Location, Summary, YearsExperience, DesiredRole) VALUES
(6, 'UX Designer', 'Irbid, Jordan', 'UX designer who enjoys turning research into simple product flows.', 3, 'UX Designer'),
(7, 'Backend Developer', 'Amman, Jordan', 'Backend developer with experience building APIs and SQL databases.', 2, 'Backend Developer'),
(10, 'Full Stack Developer', 'Zarqa, Jordan', 'Developer experienced with JavaScript, Node.js, and React.', 3, 'Full Stack Developer'),
(14, 'Junior Product Designer', 'Amman, Jordan', 'Early career designer with a strong portfolio and research skills.', 1, 'Product Designer');

INSERT Companies (OwnerUserId, Name, Industry, Website, Location, Description) VALUES
(8, 'Jordan Tech Labs', 'Technology', 'https://jordantech.example.com', 'Amman, Jordan', 'A growing software company serving local businesses.'),
(11, 'Olive Tree Products', 'E-commerce', 'https://olivetree.example.com', 'Irbid, Jordan', 'A small team building useful online shopping experiences.');
INSERT ExpertProfiles (UserId, Headline, Bio, Organization, Location, YearsExperience, HourlyRate, Currency) VALUES
(9, 'Career interview coach', 'I help candidates prepare concise and confident interview answers.', 'Career Path Jordan', 'Amman, Jordan', 7, 35.00, 'JD'),
(12, 'Software engineering mentor', 'I coach developers on technical interviews and project storytelling.', 'Independent Mentor', 'Remote', 10, 40.00, 'JD');
INSERT ExpertSpecialties (ExpertUserId, Specialty) VALUES
(9, 'Behavioral interviews'), (9, 'Career coaching'), (12, 'Technical interviews'), (12, 'Backend development');

INSERT Skills (Name) VALUES ('SQL Server'), ('UI/UX'), ('Communication'), ('Node.js');
INSERT UserSkills (UserId, SkillId, Proficiency, YearsExperience) VALUES
(6, 4, 'Advanced', 3), (6, 7, 'Advanced', 3), (6, 8, 'Intermediate', 2),
(7, 1, 'Intermediate', 2), (7, 6, 'Intermediate', 2), (7, 9, 'Advanced', 2),
(10, 1, 'Advanced', 3), (10, 2, 'Intermediate', 2), (10, 9, 'Intermediate', 2),
(14, 4, 'Intermediate', 1), (14, 5, 'Intermediate', 1), (14, 7, 'Advanced', 1);

INSERT Jobs (CompanyId, PostedByUserId, Title, Description, Location, EmploymentType, WorkplaceType, SalaryMin, SalaryMax, Currency, Status, PostedAt) VALUES
(2, 8, 'Backend Developer', 'Build and maintain APIs and database services for customer products.', 'Amman, Jordan', 'full_time', 'onsite', 1100, 1600, 'JD', 'open', '2026-11-01T09:00:00'),
(2, 8, 'UX Designer', 'Improve user journeys through research, wireframes, and usability testing.', 'Amman, Jordan', 'full_time', 'hybrid', 1000, 1500, 'JD', 'open', '2026-11-02T09:00:00'),
(3, 11, 'Full Stack Developer', 'Help build web features using React, Node.js, and SQL Server.', 'Irbid, Jordan', 'full_time', 'remote', 1200, 1700, 'JD', 'open', '2026-11-03T09:00:00');
INSERT JobSkills (JobId, SkillId, IsRequired) VALUES
(3, 6, 1), (3, 9, 1), (4, 4, 1), (4, 7, 1), (5, 2, 1), (5, 6, 1), (5, 9, 1);

INSERT Resumes (UserId, FileName, FileUrl, ExtractedText, IsPrimary, UploadedAt) VALUES
(6, 'Lina_Haddad_CV.pdf', '/demo/resumes/lina-cv.pdf', 'UX designer with research and usability testing experience.', 1, '2026-11-01T10:00:00'),
(7, 'Yazan_Saleh_CV.pdf', '/demo/resumes/yazan-cv.pdf', 'Backend developer with Node.js and SQL Server experience.', 1, '2026-11-01T11:00:00'),
(10, 'Sami_Khatib_CV.pdf', '/demo/resumes/sami-cv.pdf', 'Full stack developer experienced with React, Node.js, and databases.', 1, '2026-11-02T10:00:00'),
(14, 'Mira_Yousef_CV.pdf', '/demo/resumes/mira-cv.pdf', 'Junior product designer with portfolio and user research projects.', 1, '2026-11-02T11:00:00');

INSERT CVAnalyses (ResumeId, TargetJobId, OverallScore, FindingsJson, RecommendationsJson, Status, CreatedAt) VALUES
(3, 4, 88, '{"strengths":["Research experience","Good portfolio"]}', '["Add project outcomes"]', 'completed', '2026-11-01T10:20:00'),
(4, 3, 79, '{"strengths":["API experience"],"gaps":["Add deployment details"]}', '["Describe a production project"]', 'completed', '2026-11-01T11:20:00'),
(5, 5, 85, '{"strengths":["React and Node.js"]}', '["Add more measurable results"]', 'completed', '2026-11-02T10:20:00'),
(6, 2, 76, '{"strengths":["Strong portfolio"]}', '["Add more user research outcomes"]', 'completed', '2026-11-02T11:20:00');

INSERT SavedJobs (UserId, JobId, SavedAt) VALUES
(6, 2, '2026-11-01T12:00:00'), (7, 3, '2026-11-01T12:30:00'),
(10, 5, '2026-11-02T12:00:00'), (14, 4, '2026-11-02T12:30:00');

INSERT JobApplications (JobId, CandidateUserId, ResumeId, Status, MatchScore, CoverLetter, AppliedAt) VALUES
(4, 6, 3, 'applied', 89, 'My UX research experience matches the role.', '2026-11-03T09:00:00'),
(3, 7, 4, 'interview', 83, 'I have built APIs using Node.js and SQL Server.', '2026-11-03T09:30:00'),
(5, 10, 5, 'screening', 91, 'I can contribute across the React and Node.js stack.', '2026-11-03T10:00:00'),
(4, 14, 6, 'applied', 78, 'I am excited to grow as a product designer.', '2026-11-03T10:30:00');

INSERT ApplicationStageHistory (ApplicationId, ChangedByUserId, OldStatus, NewStatus, Note, ChangedAt) VALUES
(3, 8, NULL, 'applied', 'Application submitted.', '2026-11-03T09:00:00'),
(4, 8, NULL, 'applied', 'Application submitted.', '2026-11-03T09:30:00'),
(4, 8, 'applied', 'screening', 'Profile selected for an initial conversation.', '2026-11-04T09:00:00'),
(5, 11, NULL, 'applied', 'Application submitted.', '2026-11-03T10:00:00'),
(5, 11, 'applied', 'screening', 'Skills match the job requirements.', '2026-11-04T10:00:00'),
(6, 8, NULL, 'applied', 'Application submitted.', '2026-11-03T10:30:00');

INSERT InterviewQuestions (QuestionText, Category, InterviewType, Difficulty, IsActive, CreatedByUserId) VALUES
('How do you decide which usability issue to fix first?', 'User experience', 'behavioral', 'medium', 1, 4),
('Explain how you would design a simple REST API.', 'Backend development', 'technical', 'medium', 1, 4),
('Tell me about a time you worked through a difficult bug.', 'Problem solving', 'behavioral', 'medium', 1, 13),
('How do you test a responsive React page?', 'Frontend development', 'technical', 'easy', 1, 13);

INSERT InterviewSessions (CandidateUserId, JobId, ApplicationId, Title, InterviewType, Status, StartedAt, CompletedAt, DurationMinutes, OverallScore, CreatedAt) VALUES
(6, 4, 3, 'UX Designer Practice', 'behavioral', 'completed', '2026-11-03T13:00:00', '2026-11-03T13:22:00', 22, 88, '2026-11-03T12:55:00'),
(7, 3, 4, 'Backend Developer Practice', 'technical', 'completed', '2026-11-04T14:00:00', '2026-11-04T14:28:00', 28, 81, '2026-11-04T13:55:00'),
(10, 5, 5, 'Full Stack Developer Practice', 'job_specific', 'completed', '2026-11-04T15:00:00', '2026-11-04T15:25:00', 25, 86, '2026-11-04T14:55:00');

INSERT InterviewAnswers (InterviewId, QuestionId, QuestionText, AnswerText, AnsweredAt, Score, Feedback) VALUES
(2, 3, 'How do you decide which usability issue to fix first?', 'I compare user impact, frequency, and effort, then validate the priority with the team.', '2026-11-03T13:08:00', 88, 'Good prioritization approach; include a concrete example.'),
(3, 4, 'Explain how you would design a simple REST API.', 'I would define the resources, endpoints, validation, and clear response codes.', '2026-11-04T14:08:00', 81, 'Clear structure; explain how you would secure the endpoints.'),
(4, 5, 'Tell me about a time you worked through a difficult bug.', 'I narrowed the issue with logs, reproduced it, and tested a small fix before release.', '2026-11-04T15:08:00', 86, 'Good troubleshooting sequence; describe the result with a metric.');

INSERT InterviewScoreBreakdown (InterviewId, Criterion, Score, Feedback) VALUES
(2, 'Communication', 90, 'Clear and organized explanation.'), (2, 'Problem solving', 86, 'Prioritized issues logically.'),
(3, 'Technical knowledge', 82, 'Good API fundamentals.'), (3, 'Confidence', 80, 'Continue practicing concise explanations.'),
(4, 'Problem solving', 88, 'Explained a useful debugging process.'), (4, 'Communication', 84, 'Answer was easy to follow.');

INSERT InterviewReports (InterviewId, Summary, StrengthsJson, ImprovementsJson, RecommendationsJson) VALUES
(2, 'Strong UX practice with a clear user-centered approach.', '["User focus","Prioritization"]', '["Give a specific example"]', '["Practice explaining research impact"]'),
(3, 'Good technical foundation and structured API answer.', '["API fundamentals","Clear structure"]', '["Discuss security"]', '["Review authentication and validation"]'),
(4, 'Confident full stack practice with a practical debugging story.', '["Debugging approach","Relevant experience"]', '["Add measurable results"]', '["Practice concise STAR answers"]');

INSERT TrainingPlanItems (UserId, SourceInterviewId, Title, Description, Category, DueDate, Status) VALUES
(6, 2, 'Prepare a usability case study', 'Describe a research finding and how it changed a product decision.', 'User experience', '2026-11-15', 'in_progress'),
(7, 3, 'Review API security basics', 'Practice explaining authentication, validation, and error handling.', 'Technical', '2026-11-16', 'not_started'),
(10, 4, 'Add results to debugging stories', 'Prepare one example with a clear before-and-after outcome.', 'Communication', '2026-11-17', 'not_started');

INSERT ExpertAvailability (ExpertUserId, DayOfWeek, StartTime, EndTime, TimeZone, IsActive) VALUES
(9, 1, '10:00', '14:00', 'Asia/Amman', 1), (9, 3, '12:00', '16:00', 'Asia/Amman', 1),
(12, 2, '09:00', '12:00', 'Asia/Amman', 1), (12, 5, '13:00', '17:00', 'Asia/Amman', 1);

INSERT ExpertBookings (CandidateUserId, ExpertUserId, RelatedJobId, Title, StartsAt, EndsAt, CandidateNotes, Status, Price) VALUES
(6, 9, 4, 'UX portfolio review', '2026-11-18T10:00:00', '2026-11-18T11:00:00', 'Please review my case study.', 'completed', 35),
(7, 12, 3, 'Technical interview coaching', '2026-11-19T11:00:00', '2026-11-19T12:00:00', 'I want to practice backend questions.', 'completed', 40),
(10, 12, 5, 'Full stack interview preparation', '2026-11-25T13:00:00', '2026-11-25T14:00:00', 'Please focus on explaining project architecture.', 'confirmed', 40),
(14, 9, 2, 'Portfolio feedback session', '2026-11-27T12:00:00', '2026-11-27T13:00:00', 'I would like feedback on my portfolio.', 'booked', 35);

INSERT ExpertReviews (BookingId, CandidateUserId, ExpertUserId, Rating, ReviewText) VALUES
(2, 6, 9, 5, 'Helpful feedback and a clear plan for improving my portfolio.'),
(3, 7, 12, 4, 'The technical practice helped me feel more prepared.');

INSERT Notifications (UserId, Title, Message, TargetUrl, IsRead, CreatedAt) VALUES
(6, 'Application received', 'Your UX Designer application was submitted.', '../Job seeker/my-applications.html', 0, '2026-11-03T09:01:00'),
(7, 'Interview practice complete', 'Your backend practice report is ready.', '../Job seeker/report.html', 0, '2026-11-04T14:30:00'),
(8, 'New candidate application', 'A candidate applied for UX Designer.', 'applicants.html', 0, '2026-11-03T09:02:00'),
(9, 'Session completed', 'A candidate left a review after a session.', 'expert-reviews.html', 0, '2026-11-18T11:05:00'),
(12, 'New session booking', 'A candidate booked a coaching session.', 'expert-sessions.html', 0, '2026-11-25T13:01:00'),
(13, 'Platform activity', 'New demo accounts were added.', 'admin-users.html', 1, '2026-11-04T16:00:00');

INSERT UserSettings (UserId, Theme, LanguageCode, EmailNotifications, PushNotifications) VALUES
(6, 'light', 'en', 1, 1), (7, 'dark', 'en', 1, 1), (8, 'light', 'en', 1, 0), (9, 'light', 'en', 1, 1),
(10, 'light', 'en', 1, 1), (11, 'dark', 'en', 1, 0), (12, 'light', 'en', 1, 1), (13, 'light', 'en', 1, 0), (14, 'light', 'en', 1, 1);

INSERT InterviewOptions (OptionType, OptionValue, DisplayLabel, SortOrder) VALUES
('duration', '20', '20 minutes', 4), ('duration', '60', '60 minutes', 5),
('interview_type', 'general', 'General', 4), ('difficulty', 'easy', 'Easy', 1), ('difficulty', 'medium', 'Medium', 2), ('difficulty', 'hard', 'Hard', 3);

INSERT ScoringCriteria (Name, Description, Weight) VALUES
('Problem solving', 'Approach to analyzing and resolving challenges.', 1.00),
('Role knowledge', 'Knowledge of the skills needed for the role.', 1.00),
('Examples', 'Use of relevant examples from past experience.', 1.00);

INSERT ContentBlocks (AudienceRole, ContentKey, Title, Body, IsPublished, UpdatedByUserId) VALUES
('job_seeker', 'practice_tip', 'Practice tip', 'Use a short example to explain your decisions and results.', 1, 4),
('employer', 'interview_tip', 'Interview tip', 'Share the interview format with candidates before the meeting.', 1, 13),
('expert', 'expert_welcome', 'Welcome experts', 'Keep your availability up to date so candidates can book a session.', 1, 13);

INSERT PlatformSchedules (Title, Description, StartsAt, EndsAt, Status, CreatedByUserId) VALUES
('Question bank review', 'Review and update sample interview questions.', '2026-11-10T09:00:00', '2026-11-10T10:00:00', 'scheduled', 4),
('Monthly platform check', 'Review demo platform activity and reports.', '2026-11-30T13:00:00', '2026-11-30T14:00:00', 'scheduled', 13);
GO
