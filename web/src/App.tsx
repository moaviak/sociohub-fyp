import { Route, Routes } from "react-router";

import AppLayout from "@/layouts/app/layout";
import MainLayout from "@/layouts/main-layout";
import AuthLayout from "@/layouts/auth/layout";
import MarketingLayout from "@/layouts/marketing/layout";

import SignUpPage from "@/pages/public/signup-page";
import SignInPage from "@/pages/public/signin-page";
import LandingPage from "@/pages/public/landing-page";
import ContactPage from "@/pages/public/contact-page";
import StudentSignUpPage from "@/pages/public/student-signup-page";
import AdvisorSignUpPage from "@/pages/public/advisor-signup-page";

import MembersPage from "@/pages/app/members";
import NotFoundPage from "@/pages/not-found-page";
import ExplorePage from "@/pages/app/explore-page";
import DashboardPage from "@/pages/app/dashboard-page";
import RolesPage from "@/pages/app/members/roles-page";
import SocietyFormPage from "@/pages/society-form-page";
import VerifyEmailPage from "@/pages/verify-email-page";
import RequestsPage from "@/pages/app/members/requests-page";
import RequestsHistoryPage from "./pages/app/members/requests-history-page";
import { NotificationSocketProvider } from "./features/app/notifications/socket-provider";
import EventsPage from "./pages/app/events";
import CreateEventPage from "./pages/app/events/create-event-page";
import UpdateEventPage from "./pages/app/events/update-event-page";
import EventDetailPage from "./pages/app/events/event-detail-page";
import MyEventsPage from "./pages/app/events/my-events-page";
import AnnouncementsPage from "./pages/app/announcements";
import CreateAnnouncementPage from "./pages/app/announcements/create-announcement";
import EditAnnouncementPage from "./pages/app/announcements/edit-announcement";
import TodoListPage from "./pages/app/todo-list-page";
import SocietyPage from "./pages/app/society-page";
import SocietySettingsLayout from "./layouts/app/society-settings-layout";
import SocietySettingsPage from "./pages/app/society-settings";
import ProfileSettingsPage from "./pages/app/society-settings/profile-settings-page";
import MembersSettingsPage from "./pages/app/society-settings/members-settings-page";
import UserProfilePage from "./pages/app/user";
import UserSettingsLayout from "./layouts/app/user-settings-layout";
import UserSettingsPage from "./pages/app/user/settings-page";
import UserProfileSettingsPage from "./pages/app/user/profile-settings-page";

function App() {
  return (
    <NotificationSocketProvider>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public Marketing Routes */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/contact-us" element={<ContactPage />} />
          </Route>

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            {/* Public Auth Routes */}
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />}>
              <Route path="student" element={<StudentSignUpPage />} />
              <Route path="advisor" element={<AdvisorSignUpPage />} />
            </Route>

            {/* Auth-Required Onboarding Routes */}
            <Route path="/sign-up/verify-email" element={<VerifyEmailPage />} />
            <Route path="/sign-up/society-form" element={<SocietyFormPage />} />
          </Route>

          {/* Private Routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Student specific routes */}
            <Route path="/explore" element={<ExplorePage />}></Route>

            {/* Society specific  routes*/}
            <Route path="/society" element={<SocietyPage />}>
              <Route path=":societyId" element={<SocietyPage />} />
            </Route>

            <Route path="/members" element={<MembersPage />}>
              <Route path="roles" element={<RolesPage />} />
              <Route path="requests" element={<RequestsPage />}>
                <Route path="history" element={<RequestsHistoryPage />} />
              </Route>
              <Route path=":societyId" element={<MembersPage />}>
                <Route path="roles" element={<RolesPage />} />
                <Route path="requests" element={<RequestsPage />}>
                  <Route path="history" element={<RequestsHistoryPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="/events" element={<EventsPage />}>
              <Route path="create-event" element={<CreateEventPage />} />

              <Route path=":societyId" element={<EventsPage />}>
                <Route path="create-event" element={<CreateEventPage />} />
              </Route>
            </Route>

            <Route path="/announcements" element={<AnnouncementsPage />}>
              <Route
                path="create-announcement"
                element={<CreateAnnouncementPage />}
              />

              <Route path=":societyId" element={<AnnouncementsPage />}>
                <Route
                  path="create-announcement"
                  element={<CreateAnnouncementPage />}
                />
              </Route>
            </Route>

            <Route path="/settings" element={<SocietySettingsLayout />}>
              <Route index element={<SocietySettingsPage />} />
              <Route path="profile" element={<ProfileSettingsPage />} />
              <Route path="members" element={<MembersSettingsPage />} />

              <Route path=":societyId" element={<SocietySettingsPage />} />
              <Route
                path=":societyId/profile"
                element={<ProfileSettingsPage />}
              />
              <Route
                path=":societyId/members"
                element={<MembersSettingsPage />}
              />
            </Route>

            {/* Add other private routes here */}
            <Route path="/todo" element={<TodoListPage />} />
            <Route path="/my-events" element={<MyEventsPage />} />

            <Route path="/event/:id" element={<EventDetailPage />} />
            <Route path="update-event/:eventid" element={<UpdateEventPage />} />
            <Route
              path="/edit-announcement/:id"
              element={<EditAnnouncementPage />}
            />

            <Route path="/profile/:id" element={<UserProfilePage />} />
            <Route path="/user-settings" element={<UserSettingsLayout />}>
              <Route index element={<UserSettingsPage />} />
              <Route path="profile" element={<UserProfileSettingsPage />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </NotificationSocketProvider>
  );
}
export default App;
