import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";

import { Music } from "./pages/Music";
import { Videos } from "./pages/Videos";
import { Store } from "./pages/Store";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";

import { ScrollToTop } from "./components/ui/ScrollToTop";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/music" element={<Music />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/store" element={<Store />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
