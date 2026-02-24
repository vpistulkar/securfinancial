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
  
  // Ensure column has data-aue-model attribute for UE recognition
  if (!col.hasAttribute('data-aue-model')) {
    col.setAttribute('data-aue-model', 'column');
    col.setAttribute('data-aue-type', 'component');
  }
  
  // Try to find alignment value in column structure
  let alignmentDiv = col.querySelector('[data-aue-prop="itemAlignment"]');
  
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
    // Read the alignment value
    const alignmentP = alignmentDiv.querySelector('p');
    const alignmentValue = alignmentP?.textContent?.trim() || alignmentDiv.textContent?.trim();
    
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
  alignmentDiv.style.display = 'none';
  
  // Set up MutationObserver to watch for changes to the alignment field
  // This ensures the classes update when the user changes the value in UE
  if (!col._alignmentObserver) {
    const observer = new MutationObserver((mutations) => {
      // Only update if the mutation is actually changing the text content
      const hasRelevantChange = mutations.some(mutation => {
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
          return true;
        }
        return false;
      });
      
      if (hasRelevantChange) {
        updateAlignment();
      }
    });
    
    // Observe the alignment div and its children for changes
    observer.observe(alignmentDiv, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    col._alignmentObserver = observer;
  }
  
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
          // Re-process all columns in case new ones were added
          [...block.children].forEach((row) => {
            [...row.children].forEach((col) => {
              // Only process columns that haven't been processed yet
              if (!col._alignmentProcessed) {
                processColumnAlignment(col);
              }
            });
          });
        }, 100);
      }
    };
    
    // Listen for content-add events (when new items are added)
    document.querySelector('main')?.addEventListener('aue:content-add', handleUEEvent);
    document.querySelector('main')?.addEventListener('aue:content-update', handleUEEvent);
    
    block._ueListenerAdded = true;
  }
}
