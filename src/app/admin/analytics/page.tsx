import { Metadata } from "next";
import AdminAnalyticsClient from "./AdminAnalyticsClient";

export const metadata: Metadata = {
  title: "Admin Analytics & Feedback | SajiloTools",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminAnalyticsPage() {
  return <AdminAnalyticsClient />;
}
