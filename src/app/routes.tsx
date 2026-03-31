import React from 'react';
import { createBrowserRouter } from 'react-router';
import type { RouteObject } from 'react-router';
import { Layout } from '@/app/pages/Layout';
import { AdminLayout } from '@/app/pages/AdminLayout';
import { ErrorPage } from '@/app/pages/ErrorPage';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { AdminLoginPage } from '@/app/pages/AdminLoginPage'; // Import directly - no lazy loading

// Lazy load all pages for better performance
const HomePage = React.lazy(() => import('@/app/pages/HomePage').then(m => ({ default: m.HomePage })));
const AboutPage = React.lazy(() => import('@/app/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const HighlightsPage = React.lazy(() => import('@/app/pages/HighlightsPage').then(m => ({ default: m.HighlightsPage })));
const OurWorkPage = React.lazy(() => import('@/app/pages/OurWorkPage').then(m => ({ default: m.OurWorkPage })));
const NewsPage = React.lazy(() => import('@/app/pages/NewsPage').then(m => ({ default: m.NewsPage })));
const BlogPage = React.lazy(() => import('@/app/pages/BlogPage').then(m => ({ default: m.BlogPage })));
const PublicationsPage = React.lazy(() => import('@/app/pages/PublicationsPage').then(m => ({ default: m.PublicationsPage })));
const ContactPage = React.lazy(() => import('@/app/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const AdminDashboardPage = React.lazy(() => import('@/app/pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const NotFoundPage = React.lazy(() => import('@/app/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Lazy load Our Work sub-pages
const InternationallyFundedPage = React.lazy(() => import('@/app/pages/our-work/InternationallyFundedPage').then(m => ({ default: m.InternationallyFundedPage })));
const LocallyFundedPage = React.lazy(() => import('@/app/pages/our-work/LocallyFundedPage').then(m => ({ default: m.LocallyFundedPage })));
const CommunityTransformationPage = React.lazy(() => import('@/app/pages/our-work/CommunityTransformationPage').then(m => ({ default: m.CommunityTransformationPage })));
const InternshipProgramPage = React.lazy(() => import('@/app/pages/our-work/InternshipProgramPage').then(m => ({ default: m.InternshipProgramPage })));
const FinancialStatementsPage = React.lazy(() => import('@/app/pages/our-work/FinancialStatementsPage').then(m => ({ default: m.FinancialStatementsPage })));
const StudyFindingsPage = React.lazy(() => import('@/app/pages/our-work/StudyFindingsPage').then(m => ({ default: m.StudyFindingsPage })));

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'about', element: <AboutPage /> },
        { path: 'highlights', element: <HighlightsPage /> },
        { path: 'our-work', element: <OurWorkPage /> },

        // New Our Work Sub-routes
        { path: 'our-work/internationally-funded', element: <InternationallyFundedPage /> },
        { path: 'our-work/locally-funded', element: <LocallyFundedPage /> },
        { path: 'our-work/community-transformation', element: <CommunityTransformationPage /> },
        { path: 'our-work/internship-program', element: <InternshipProgramPage /> },
        { path: 'our-work/financial-statements', element: <FinancialStatementsPage /> },
        { path: 'our-work/study-findings', element: <StudyFindingsPage /> },

        { path: 'news', element: <NewsPage /> },
        { path: 'blog', element: <BlogPage /> },
        { path: 'publications', element: <PublicationsPage /> },
        { path: 'contact', element: <ContactPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
    {
      path: '/admin',
      element: <AdminLayout />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <AdminLoginPage /> },
        { path: 'dashboard', element: <ProtectedRoute><AdminDashboardPage /></ProtectedRoute> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);