import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { isSectionVisible } from '../../utils/sections';

// One /api/content check per page load, shared by every anchor.
let gridShownPromise = null;
const servicesGridShown = () => {
  if (!gridShownPromise) {
    gridShownPromise = api
      .get('/api/content')
      .then((res) => isSectionVisible(res.data, 'services'))
      .catch(() => false);
  }
  return gridShownPromise;
};

/**
 * Invisible landing point for a service menu link (e.g. #photography) inside
 * the section that link should scroll to — see SERVICE_LINK_TARGETS. Rendered
 * only while the services grid is hidden: when it is shown, its cards carry
 * these ids and a second copy would capture the link.
 */
export default function ServiceAnchor({ id }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let live = true;
    servicesGridShown().then((shown) => {
      if (live) setShow(!shown);
    });
    return () => {
      live = false;
    };
  }, []);

  return show ? <span id={id} className="service-anchor" aria-hidden="true" /> : null;
}
