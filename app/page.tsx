import Header from "@/components/Header";
import MealCard from "@/components/home/MealCard";
import NoticeCard from "@/components/home/NoticeCard";
import QuickMenu from "@/components/home/QuickMenu";
import WelcomeCard from "@/components/home/WelcomeCard";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-24 pt-6">
        <WelcomeCard />
        <MealCard />
        <NoticeCard />
        <QuickMenu />
      </main>
    </div>
  );
}