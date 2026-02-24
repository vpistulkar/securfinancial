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

export default function decorate(block) {
  // Read column widths from block configuration
  // Config fields are in the first few children: columns, rows, columnWidths
  const readConfigValue = (index) => {
    const configDiv = block.querySelector(`:scope > div:nth-child(${index}) > div`);
    return configDiv?.textContent?.trim() || '';
  };

  const columnWidthsStr = readConfigValue(3); // Third config field (after columns and rows)
  
  // Parse column widths
  let columnWidths = [];
  if (columnWidthsStr) {
    columnWidths = columnWidthsStr.split(',').map(w => {
      const num = parseFloat(w.trim());
      return isNaN(num) ? null : num;
    }).filter(w => w !== null);
    
    // Normalize percentages to sum to 100 if they don't
    const sum = columnWidths.reduce((a, b) => a + b, 0);
    if (sum > 0 && sum !== 100) {
      columnWidths = columnWidths.map(w => (w / sum) * 100);
    }
  }

  // Hide config divs but keep them for Universal Editor
  for (let i = 1; i <= 3; i++) {
    const configDiv = block.querySelector(`:scope > div:nth-child(${i})`);
    if (configDiv) {
      configDiv.style.display = 'none';
    }
  }

  // Find the first row to determine column count
  const firstRow = block.querySelector(':scope > div:nth-child(4)') || block.firstElementChild;
  const cols = firstRow ? [...firstRow.children] : [];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row, rowIndex) => {
    // Skip config divs (first 3 children are config fields)
    if (rowIndex < 3) {
      return; // Already hidden above
    }
    
    row.classList.add('columns-row');
    
    // Apply custom widths if provided
    if (columnWidths.length > 0) {
      [...row.children].forEach((col, colIndex) => {
        if (colIndex < columnWidths.length) {
          const width = columnWidths[colIndex];
          col.style.flex = `0 0 ${width}%`;
          col.style.maxWidth = `${width}%`;
        }
      });
    }
    
    //const firstChild = row.querySelector(':scope > div:first-child');
    [...row.children].forEach((col) => {
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
}
