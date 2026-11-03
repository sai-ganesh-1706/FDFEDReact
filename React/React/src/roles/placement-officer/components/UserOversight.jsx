import Sidebar from "./Sidebar";
import Header from "./Header";
import AccountDirectory from "../../../shared/components/AccountDirectory.jsx";
import "./styles/p1.css";
import "./styles/p5.css";
import "./styles/user-oversight.css";

export default function UserOversight({ onNavigate, activePage = "p5" }) {
  return (
    <div className="frame user-oversight-page">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <Header title="User Oversight" onNavigate={onNavigate} />
      <main className="main-content" id="mainContent">
        <AccountDirectory />
      </main>
    </div>
  );
}
