// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import { Clock8 } from "lucide-react";

export default function Home() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h1>
          P<Clock8 className="logo" strokeWidth={2.75} />
          cket Heist
        </h1>
        <div>Mischief, managed.</div>
        <p className="mt-4 text-md text-gray-400 max-w-sm text-left">
          Assign sneaky little tasks to your coworkers — water the plant, fix
          the printer, bring donuts. Track progress, set deadlines, and cause
          just enough chaos to keep things interesting.
        </p>
      </div>
    </div>
  );
}
