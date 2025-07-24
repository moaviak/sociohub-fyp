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
import { SocketProvider } from "./providers/socket-provider";
import ChatsPage from "./pages/app/chats";
import MeetingRoomPage from "./pages/app/meeting-room-page";
import SocietyPage from "./pages/app/society-page";
import EventsPage from "./pages/app/events";
import CreateEventPage from "./pages/app/events/create-event-page";
import PaymentsPage from "./pages/app/payments";
import TransactionsPage from "./pages/app/payments/transactions-page";
import AnnouncementsPage from "./pages/app/announcements";
import CreateAnnouncementPage from "./pages/app/announcements/create-announcement";
import VideoMeetingPage from "./pages/app/video-meeting-page";
import SocietySettingsLayout from "./layouts/app/society-settings-layout";
import UserSettingsLayout from "./layouts/app/user-settings-layout";
import EditAnnouncementPage from "./pages/app/announcements/edit-announcement";
import EventDetailPage from "./pages/app/events/event-detail-page";
import MyEventsPage from "./pages/app/events/my-events-page";
import UpdateEventPage from "./pages/app/events/update-event-page";
import { PaymentCancelledPage } from "./pages/app/payments/payment-cancelled-page";
import { PaymentSuccessPage } from "./pages/app/payments/payment-success-page";
import SocietySettingsPage from "./pages/app/society-settings";
import MembersSettingsPage from "./pages/app/society-settings/members-settings-page";
import OnboardingCompletePage from "./pages/app/society-settings/onboarding-complete-page";
import OnboardingRefreshPage from "./pages/app/society-settings/onboarding-refresh-page";
import PaymentSettingsPage from "./pages/app/society-settings/payment-settings-page";
import ProfileSettingsPage from "./pages/app/society-settings/profile-settings-page";
import TodoListPage from "./pages/app/todo-list-page";
import UserProfilePage from "./pages/app/user";
import UserProfileSettingsPage from "./pages/app/user/profile-settings-page";
import UserSettingsPage from "./pages/app/user/settings-page";
import ChatViewPage from "./pages/app/chats/chat-view-page";
import CreatePostPage from "./pages/app/posts/create-post-page";
import PostDetailPage from "./pages/app/posts/post-detail-page";

function App() {
  return (
    <SocketProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route
            path="/meeting-room/:meetingId"
            element={<MeetingRoomPage />}
          />
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

            <Route path="/create-post" element={<CreatePostPage />}>
              <Route path=":societyId" element={<CreatePostPage />} />
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

            <Route path="/payments" element={<PaymentsPage />}>
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path=":societyId" element={<PaymentsPage />}>
                <Route path="transactions" element={<TransactionsPage />} />
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

            <Route path="/video-meetings" element={<VideoMeetingPage />}>
              <Route path=":societyId" element={<VideoMeetingPage />} />
            </Route>

            <Route path="/settings" element={<SocietySettingsLayout />}>
              <Route index element={<SocietySettingsPage />} />
              <Route path="profile" element={<ProfileSettingsPage />} />
              <Route path="members" element={<MembersSettingsPage />} />
              <Route path="payments" element={<PaymentSettingsPage />}>
                <Route path="complete" element={<OnboardingCompletePage />} />
                <Route path="refresh" element={<OnboardingRefreshPage />} />
              </Route>

              <Route path=":societyId" element={<SocietySettingsPage />} />
              <Route
                path=":societyId/profile"
                element={<ProfileSettingsPage />}
              />
              <Route
                path=":societyId/members"
                element={<MembersSettingsPage />}
              />
              <Route
                path=":societyId/payments"
                element={<PaymentSettingsPage />}
              >
                <Route path="complete" element={<OnboardingCompletePage />} />
                <Route path="refresh" element={<OnboardingRefreshPage />} />
              </Route>
            </Route>

            {/* Add other private routes here */}
            <Route path="/todo" element={<TodoListPage />} />
            <Route path="/my-events" element={<MyEventsPage />} />
            <Route path="/chats" element={<ChatsPage />}>
              <Route path=":chatId" element={<ChatViewPage />} />
            </Route>

            <Route path="/event/:id" element={<EventDetailPage />} />
            <Route path="update-event/:eventid" element={<UpdateEventPage />} />
            <Route
              path="/edit-announcement/:id"
              element={<EditAnnouncementPage />}
            />
            <Route path="/posts/:postId" element={<PostDetailPage />} />

            <Route path="/profile/:id" element={<UserProfilePage />} />
            <Route path="/user-settings" element={<UserSettingsLayout />}>
              <Route index element={<UserSettingsPage />} />
              <Route path="profile" element={<UserProfileSettingsPage />} />
            </Route>

            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-cancel" element={<PaymentCancelledPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </SocketProvider>
  );
}
export default App;
