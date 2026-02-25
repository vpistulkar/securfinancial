function embedYoutube(url, autoplay, background) {
  const usp = new URLSearchParams(url.search);
  let suffix = '';
  if (background || autoplay) {
    const suffixParams = {
      autoplay: autoplay ? '1' : '0',
      mute: background ? '1' : '0',
      controls: background ? '0' : '1',
      disablekb: background ? '1' : '0',
      loop: background ? '1' : '0',
      playsinline: background ? '1' : '0',
    };
    suffix = `&${Object.entries(suffixParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
  }
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }

  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

function getVideoElement(source, autoplay, background) {
  const video = document.createElement('video');
  video.setAttribute('controls', '');
  if (autoplay) video.setAttribute('autoplay', '');
  if (background) {
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.removeAttribute('controls');
    video.addEventListener('canplay', () => {
      video.muted = true;
      if (autoplay) video.play();
    });
  }

  const sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', source);
  sourceEl.setAttribute('type', 'video/mp4');
  video.append(sourceEl);

  return video;
}

const loadVideoEmbed = (block, link, autoplay, background) => {
  const isYoutube = link.includes('youtube') || link.includes('youtu.be');
  if (isYoutube) {
    const url = new URL(link);
    const embedWrapper = embedYoutube(url, autoplay, background);
    block.append(embedWrapper);
    embedWrapper.querySelector('iframe').addEventListener('load', () => {
      block.dataset.embedLoaded = true;
    });
  } else {
    const videoEl = getVideoElement(link, autoplay, background);
    block.append(videoEl);
    videoEl.addEventListener('canplay', () => {
      block.dataset.embedLoaded = true;
    });
  }
};

function isVideoLink(link) {
    try {
        if (!link) return false;
        // Check for regular video files
        const regularVideoCheck = link.match(/\.(mp4|mov|wmv|avi|mkv|webm)$/i) !== null;

        // Check for YouTube URLs
        const youtubeCheck = (
          link.includes('youtube.com') ||
          link.includes('youtu.be') ||
          link.includes('youtube-nocookie.com')
        );

        // Combined check
        const isVideo = regularVideoCheck || youtubeCheck;

        // Log the type of video for debugging
        if (isVideo) {
            console.log('Video type:', {
                isRegularVideo: regularVideoCheck,
                isYouTube: youtubeCheck,
                url: link
            });
        }

        return isVideo;

    } catch (error) {
        console.error('Error checking video link:', error);
        return false;
    }
}

// Process a single column for alignment
function processColumnAlignment(col) {
  // Skip if already processed
  if (col._alignmentProcessed) {
    return;
  }
  
  // Ensure column has proper UE attributes for recognition and + icon functionality
  // These attributes are CRITICAL for UE to show the + icon and allow adding child components
  if (!col.hasAttribute('data-aue-model')) {
    col.setAttribute('data-aue-model', 'column');
  }
  if (!col.hasAttribute('data-aue-type')) {
    col.setAttribute('data-aue-type', 'component');
  }
  // CRITICAL: data-aue-filter tells UE what components can be added as children
  if (!col.hasAttribute('data-aue-filter')) {
    col.setAttribute('data-aue-filter', 'column');
  }
  // data-aue-behavior helps UE recognize this as a container component
  if (!col.hasAttribute('data-aue-behavior')) {
    col.setAttribute('data-aue-behavior', 'component');
  }
  
  // Try to find alignment value in column structure
  // Check multiple possible locations where AEM might store it
  let alignmentDiv = col.querySelector('[data-aue-prop="itemAlignment"]');
  
  // Also check if it's a direct child div or p tag
  if (!alignmentDiv) {
    // Check if any direct child has the data-aue-prop
    alignmentDiv = Array.from(col.children).find(child => 
      child.hasAttribute('data-aue-prop') && 
      child.getAttribute('data-aue-prop') === 'itemAlignment'
    );
  }
  
  // Also check for p tag with data-aue-prop (like tabs block does)
  if (!alignmentDiv) {
    const alignmentP = col.querySelector('p[data-aue-prop="itemAlignment"]');
    if (alignmentP) {
      alignmentDiv = alignmentP.parentElement || alignmentP;
    }
  }
  
  // Only process if alignment field exists (UE should create it)
  // Don't create it ourselves as it might interfere with UE's structure
  if (!alignmentDiv) {
    // If it doesn't exist, just apply default vertical alignment
    col.classList.remove('columns-item-horizontal', 'columns-item-vertical');
    col.classList.add('columns-item-vertical');
    col._alignmentProcessed = true;
    return;
  }
  
  // Function to update alignment classes based on current value
  const updateAlignment = () => {
    // Re-find alignmentDiv in case it was replaced by UE
    let currentAlignmentDiv = col.querySelector('[data-aue-prop="itemAlignment"]');
    if (!currentAlignmentDiv) {
      currentAlignmentDiv = alignmentDiv; // Fallback to original
    }
    
    // Read the alignment value - following the EXACT pattern from tabs block
    // Tabs uses: block.querySelector('p[data-aue-prop="tabsstyle"]')?.textContent?.trim()
    let alignmentValue = 'vertical'; // default
    
    // FIRST: Check for p tag with data-aue-prop (EXACT pattern from tabs block - most reliable)
    const alignmentP = col.querySelector('p[data-aue-prop="itemAlignment"]');
    if (alignmentP) {
      alignmentValue = alignmentP.textContent?.trim() || 'vertical';
    }
    
    // SECOND: If not found, check the alignment div (fallback)
    if (!alignmentP && currentAlignmentDiv) {
      // Try to find p tag inside the div
      const alignmentPInDiv = currentAlignmentDiv.querySelector('p[data-aue-prop="itemAlignment"]') ||
                              currentAlignmentDiv.querySelector('p');
      if (alignmentPInDiv) {
        alignmentValue = alignmentPInDiv.textContent?.trim() || 'vertical';
      } else {
        // Check text content of div itself
        alignmentValue = currentAlignmentDiv.textContent?.trim() || 'vertical';
      }
      
      // Also check attributes on the div
      if (!alignmentValue || alignmentValue.toLowerCase() === 'vertical') {
        const attrValue = currentAlignmentDiv.getAttribute('value') || 
                         currentAlignmentDiv.getAttribute('data-value') ||
                         currentAlignmentDiv.dataset.value ||
                         currentAlignmentDiv.getAttribute('itemAlignment');
        if (attrValue) {
          alignmentValue = String(attrValue).toLowerCase().trim();
        }
      }
    }
    
    // THIRD: Check if value is stored directly on the column div as an attribute (AEM fallback)
    if ((!alignmentP && (!currentAlignmentDiv || alignmentValue === 'vertical'))) {
      const colAttrValue = col.getAttribute('itemAlignment') || 
                           col.getAttribute('data-itemAlignment') ||
                           col.getAttribute('data-itemalignment') ||
                           col.dataset.itemAlignment ||
                           col.dataset.itemalignment ||
                           col.getAttribute('itemalignment');
      if (colAttrValue) {
        alignmentValue = String(colAttrValue).toLowerCase().trim();
      }
    }
    
    // Normalize the value - handle case-insensitive matching
    alignmentValue = alignmentValue.toLowerCase().trim();
    if (alignmentValue !== 'horizontal' && alignmentValue !== 'vertical') {
      // Try to match common variations
      if (alignmentValue.includes('horiz') || alignmentValue === 'h' || alignmentValue === 'row') {
        alignmentValue = 'horizontal';
      } else {
        alignmentValue = 'vertical';
      }
    }
    
    // Remove both classes first
    col.classList.remove('columns-item-horizontal', 'columns-item-vertical');
    
    // Apply the correct class based on current value
    if (alignmentValue === 'horizontal') {
      col.classList.add('columns-item-horizontal');
    } else {
      col.classList.add('columns-item-vertical');
    }
  };
  
  // Initial alignment update
  updateAlignment();
  
  // Hide the alignment config div (but keep it in DOM for UE)
  // Use multiple methods to ensure it's hidden
  alignmentDiv.style.display = 'none';
  alignmentDiv.style.visibility = 'hidden';
  alignmentDiv.style.height = '0';
  alignmentDiv.style.overflow = 'hidden';
  alignmentDiv.setAttribute('data-aue-hidden', 'true');
  
  // Also hide any p tags inside
  const alignmentP = alignmentDiv.querySelector('p');
  if (alignmentP) {
    alignmentP.style.display = 'none';
    alignmentP.style.visibility = 'hidden';
    alignmentP.style.height = '0';
  }
  
  // Set up MutationObserver to watch for changes to the alignment field
  // This ensures the classes update when the user changes the value in UE
  if (!col._alignmentObserver) {
    const observer = new MutationObserver(() => {
      // Always update when any mutation occurs
      updateAlignment();
    });
    
    // Observe the alignment div and its children for ALL changes
    observer.observe(alignmentDiv, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeOldValue: false
    });
    
    // Also observe the column itself in case UE replaces the alignmentDiv
    observer.observe(col, {
      childList: true,
      subtree: false
    });
    
    col._alignmentObserver = observer;
    col._updateAlignment = updateAlignment; // Store reference for UE events
    
    // Also set up a periodic check as a fallback (every 300ms when in author mode)
    // This catches cases where MutationObserver might miss changes
    if (document.documentElement.classList.contains('adobe-ue-edit')) {
      col._alignmentInterval = setInterval(() => {
        // Re-find alignmentDiv in case it was replaced
        const currentDiv = col.querySelector('[data-aue-prop="itemAlignment"]');
        if (currentDiv && currentDiv !== alignmentDiv) {
          // Alignment div was replaced, update our reference and re-observe
          alignmentDiv = currentDiv;
          observer.disconnect();
          observer.observe(alignmentDiv, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeOldValue: false
          });
          observer.observe(col, {
            childList: true,
            subtree: false
          });
          // Re-hide the new div
          alignmentDiv.style.display = 'none';
          alignmentDiv.style.visibility = 'hidden';
          alignmentDiv.style.height = '0';
          alignmentDiv.style.overflow = 'hidden';
          alignmentDiv.setAttribute('data-aue-hidden', 'true');
        }
        updateAlignment();
      }, 300);
    }
  }
  
  // Cleanup function to remove interval when column is removed
  if (col._cleanupAlignment) {
    col._cleanupAlignment();
  }
  col._cleanupAlignment = () => {
    if (col._alignmentInterval) {
      clearInterval(col._alignmentInterval);
      col._alignmentInterval = null;
    }
    if (col._alignmentObserver) {
      col._alignmentObserver.disconnect();
      col._alignmentObserver = null;
    }
  };
  
  // Mark as processed
  col._alignmentProcessed = true;
}

export default function decorate(block) {
  // Prevent re-decoration
  if (block.dataset.decorated === 'true') {
    return;
  }
  
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    row.classList.add('columns-row');
    [...row.children].forEach((col) => {
      // Process alignment for this column
      processColumnAlignment(col);
      
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
     // const videoBlock = col.querySelector('div[data-aue-model="video"]');

      const linkavl = col.querySelector('a')?.href;
      const videoBlock = linkavl ? isVideoLink(linkavl) : false;
      
      if (videoBlock) {
        const videoWrapper = col.closest('div');
        if (videoWrapper) {
          // Add video specific classes
          videoWrapper.classList.add('columns-video-col');
          
          // Get video link from button container
          const videoLink = col.querySelector('a');
          if (videoLink) {
            const videoUrl = videoLink.getAttribute('href');
            
            // Create video container
            const videoContainer = document.createElement('div');
            videoContainer.className = 'columns-video-container';
            
            // Load video with appropriate embed
            loadVideoEmbed(
              videoContainer, 
              videoUrl,
              col.dataset.autoplay === 'true',
              col.dataset.background === 'true'
            );

            // Replace button container with video container
            const buttonContainer = videoLink.closest('div');
            if (buttonContainer) {
              buttonContainer.replaceWith(videoContainer);
            }
          }
        }
      }
    });
  });
  
  // Mark block as decorated
  block.dataset.decorated = 'true';
  
  // Listen for UE events to process new columns when they're added
  if (!block._ueListenerAdded) {
    const handleUEEvent = (event) => {
      // Check if the event is related to this block or its children
      const resource = event.detail?.request?.target?.resource;
      const blockResource = block.getAttribute('data-aue-resource');
      
      if (resource && blockResource && resource.startsWith(blockResource)) {
        // Small delay to let UE finish updating the DOM
        setTimeout(() => {
          // Re-process all columns in case new ones were added or properties changed
          [...block.children].forEach((row) => {
            [...row.children].forEach((col) => {
              // CRITICAL: Ensure UE attributes are always present (they might get lost when UE adds content)
              // This is essential for the + icon to continue working
              if (!col.hasAttribute('data-aue-model')) {
                col.setAttribute('data-aue-model', 'column');
              }
              if (!col.hasAttribute('data-aue-type')) {
                col.setAttribute('data-aue-type', 'component');
              }
              if (!col.hasAttribute('data-aue-filter')) {
                col.setAttribute('data-aue-filter', 'column');
              }
              if (!col.hasAttribute('data-aue-behavior')) {
                col.setAttribute('data-aue-behavior', 'component');
              }
              
              // If already processed, just update alignment (property might have changed)
              if (col._alignmentProcessed && col._updateAlignment) {
                col._updateAlignment();
              } else if (!col._alignmentProcessed) {
                // Process new columns
                processColumnAlignment(col);
              }
            });
          });
        }, 100);
      }
    };
    
    // Listen for various UE events
    const main = document.querySelector('main');
    if (main) {
      main.addEventListener('aue:content-add', handleUEEvent);
      main.addEventListener('aue:content-update', handleUEEvent);
      main.addEventListener('aue:content-patch', handleUEEvent); // Property changes
    }
    
    block._ueListenerAdded = true;
  }
}

