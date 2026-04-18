import type { FC, MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Phone, Mail, Facebook, Linkedin } from 'lucide-react';


export const Footer: FC = () => {
  const navigate = useNavigate();

  const handleAdminClick = (e: MouseEvent) => {
    e.preventDefault();
    navigate('/admin');
  };

  return (
    <footer className="relative bg-[#2a2a2a] border-t border-white/10">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Content - Two Column Layout */}
        <div className="flex flex-col md:flex-row md:justify-between gap-6 mb-4">
          {/* Left Column - Contact Info */}
          <div>
            <div className="space-y-0.5 mb-3">
              <p className="text-sm text-white font-medium">IMPACT R&D</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider">A DOST-certified Science & Technology Foundation</p>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#1887FC] mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">47 Razburg Bldg., Manese St., San Agustin, Bay, Laguna</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1887FC] flex-shrink-0" />
                <span className="text-gray-300">(049) 547 7357</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1887FC] flex-shrink-0" />
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=main@impactrd.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-[#60a5fa] transition-colors"
                >
                  main@impactrd.org
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Follow Us */}
          <div className="md:text-right">
            <h4 className="text-xs font-semibold text-white mb-3 uppercase tracking-wide md:text-left md:ml-1">
              Follow Us
            </h4>
            <div className="space-y-1.5">
              <a
                href="https://www.facebook.com/profile.php?id=61581760197246"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#1877f2] transition-colors md:justify-end"
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  <Facebook className="w-4 h-4" />
                </span>
                <span>IMPACT R&D</span>
              </a>
              <a
                href="https://www.linkedin.com/company/impact-r-d/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#0077b5] transition-colors md:justify-end"
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  <Linkedin className="w-4 h-4" />
                </span>
                <span>IMPACT R&D</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-3 border-t border-white/10">
          <p className="text-[11px] text-gray-500 text-center">
            <span
              onClick={handleAdminClick}
              className="cursor-pointer hover:text-[#60a5fa] hover:underline transition-colors"
            >
              ©
            </span>{" "}
            2023 IMPACT R&D. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};