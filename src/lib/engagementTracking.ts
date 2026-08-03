import { trackEventWithParams, hasUserConsent } from './analytics';

/**
 * Vanilla-JS port of the former useEngagementTracking React hook — tracks scroll
 * depth, time-on-page, and section visibility without needing a React island.
 */
export function initEngagementTracking(pageName: string): void {
  if (!hasUserConsent()) return;

  const scrollDepthsTracked = new Set<number>();
  const milestones = [25, 50, 75, 100];

  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

    milestones.forEach((milestone) => {
      if (scrollPercentage >= milestone && !scrollDepthsTracked.has(milestone)) {
        trackEventWithParams('scroll_depth', {
          page_name: pageName,
          scroll_depth: milestone,
        });
        scrollDepthsTracked.add(milestone);
      }
    });
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  const maxTimeEvents = 5;
  let timeEventsTracked = 0;
  const startTime = Date.now();
  let lastTrackedTime = 0;

  const timeInterval = setInterval(() => {
    if (timeEventsTracked >= maxTimeEvents) {
      clearInterval(timeInterval);
      return;
    }

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    if (timeSpent > 0 && timeSpent >= lastTrackedTime + 30) {
      trackEventWithParams('time_on_page', {
        page_name: pageName,
        time_seconds: timeSpent,
      });
      timeEventsTracked += 1;
      lastTrackedTime = timeSpent;
    }
  }, 1000);

  const sections = document.querySelectorAll<HTMLElement>('section[data-section-name]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionName = entry.target.getAttribute('data-section-name');
          if (sectionName) {
            trackEventWithParams('section_view', {
              page_name: pageName,
              section_name: sectionName,
            });
            observer.unobserve(entry.target);
          }
        }
      });
    },
    { threshold: 0.5 }
  );
  sections.forEach((section) => observer.observe(section));
}
