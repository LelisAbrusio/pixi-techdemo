// TechDemo2.tsx
import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface DialogueItem {
  name: string;
  text: string;
}

interface Emoji {
  name: string;
  url: string;
}

interface Avatar {
  name: string;
  url: string;
  position: string; // "left" or "right"
}

interface MagicWordsData {
  dialogue: DialogueItem[];
  emojies: Emoji[];
  avatars: Avatar[];
}

interface TextSegment {
  type: 'text' | 'emoji';
  content: string;
}

// Helper: Parse dialogue text into segments (plain text or emoji tokens)
const parseDialogueText = (text: string): TextSegment[] => {
  const segments: TextSegment[] = [];
  const regex = /\{(\w+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }
    segments.push({ type: 'emoji', content: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.substring(lastIndex) });
  }
  return segments;
};

// Helper: Layout text and emoji segments with letter-by-letter wrapping.
// Each text segment is split into individual characters. All created DisplayObjects
// are pushed into displayElements for gradual reveal.
function layoutSegments(
  segments: TextSegment[],
  container: PIXI.Container,
  textStyle: PIXI.TextStyle,
  emojiMap: Record<string, string>,
  startX: number,
  startY: number,
  maxX: number, // maximum x coordinate boundary for wrapping
  lineHeight: number,
  displayElements: PIXI.DisplayObject[]
) {
  let x = startX;
  let y = startY;
  for (const seg of segments) {
    if (seg.type === 'text') {
      // Split the text into individual characters.
      for (const char of seg.content) {
        const textObj = new PIXI.Text(char, textStyle);
        if (x + textObj.width > maxX) {
          x = startX;
          y += lineHeight;
        }
        textObj.x = x;
        textObj.y = y;
        textObj.alpha = 0; // start invisible
        container.addChild(textObj);
        displayElements.push(textObj);
        x += textObj.width;
      }
    } else {
      // For emoji segments, use a fixed width.
      const emojiWidth = 24;
      if (x + emojiWidth > maxX) {
        x = startX;
        y += lineHeight;
      }
      const emojiUrl = emojiMap[seg.content];
      if (emojiUrl) {
        const emojiSprite = PIXI.Sprite.from(emojiUrl);
        emojiSprite.width = emojiWidth;
        emojiSprite.height = emojiWidth;
        emojiSprite.x = x;
        // Vertically center emoji relative to the line.
        emojiSprite.y = y + (lineHeight - emojiWidth) / 2;
        emojiSprite.alpha = 0;
        container.addChild(emojiSprite);
        displayElements.push(emojiSprite);
        x += emojiWidth;
      } else {
        // Fallback: render token as text.
        const fallback = new PIXI.Text('{' + seg.content + '}', textStyle);
        if (x + fallback.width > maxX) {
          x = startX;
          y += lineHeight;
        }
        fallback.x = x;
        fallback.y = y;
        fallback.alpha = 0;
        container.addChild(fallback);
        displayElements.push(fallback);
        x += fallback.width;
      }
    }
  }
}

const TechDemo2: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create PIXI application.
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0xffffff,
    });
    containerRef.current?.appendChild(app.view as HTMLCanvasElement);

    // Create FPS text display.
    const fpsText = new PIXI.Text("FPS: 0", {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0x000000,
    });
    fpsText.x = 10;
    fpsText.y = 10;
    app.stage.addChild(fpsText);

    let frames = 0;
    let lastTime = performance.now();
    app.ticker.add(() => {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        fpsText.text = `FPS: ${frames}`;
        frames = 0;
        lastTime = now;
      }
    });

    // Dialogue box container positioned near the bottom.
    const dialogueContainer = new PIXI.Container();
    dialogueContainer.x = 50;
    dialogueContainer.y = 400;
    app.stage.addChild(dialogueContainer);

    // Dialogue box background (700x150).
    const dialogueBG = new PIXI.Graphics();
    dialogueBG.beginFill(0x000000, 0.8);
    dialogueBG.drawRoundedRect(0, 0, 700, 150, 10);
    dialogueBG.endFill();
    dialogueContainer.addChild(dialogueBG);

    // Container for dialogue content.
    const contentContainer = new PIXI.Container();
    dialogueContainer.addChild(contentContainer);

    // "Click or press Enter to continue" indicator.
    const continueIndicator = new PIXI.Text("Click or press Enter to continue", {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xffffff,
    });
    continueIndicator.x = dialogueBG.width - continueIndicator.width - 10;
    continueIndicator.y = dialogueBG.height - continueIndicator.height - 10;
    dialogueContainer.addChild(continueIndicator);

    // Mask the content container to keep content inside the dialogue box.
    const maskShape = new PIXI.Graphics();
    maskShape.beginFill(0xffffff);
    maskShape.drawRoundedRect(0, 0, 700, 150, 10);
    maskShape.endFill();
    dialogueContainer.addChild(maskShape);
    contentContainer.mask = maskShape;

    // Data containers.
    let dialogues: DialogueItem[] = [];
    const emojiMap: Record<string, string> = {};
    const avatarMap: Record<string, Avatar> = {};
    let currentDialogueIndex = 0;

    // Variables to control gradual reveal.
    let dialogueFullyRevealed = false;
    let currentDisplayElements: PIXI.DisplayObject[] = [];

    // Common text style.
    const baseTextStyle = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xffffff,
    });

    // Function to gradually reveal display elements letter-by-letter.
    const revealElementsGradually = (
      elements: PIXI.DisplayObject[],
      revealSpeed: number // in milliseconds per element
    ) => {
      let revealCounter = 0;
      const tickerCallback = (deltaMS: number) => {
        revealCounter += deltaMS;
        while (elements.length > 0 && revealCounter >= revealSpeed) {
          const elem = elements.shift();
          if (elem) {
            elem.alpha = 1;
          }
          revealCounter -= revealSpeed;
        }
        if (elements.length === 0) {
          dialogueFullyRevealed = true;
          // For non-final dialogues, show the indicator; hide it in final dialogue.
          if (currentDialogueIndex === dialogues.length - 1) {
            continueIndicator.visible = false;
          } else {
            continueIndicator.visible = true;
          }
          app.ticker.remove(tickerCallback);
        }
      };
      app.ticker.add(tickerCallback);
    };

    // Function to immediately reveal all current display elements.
    const revealAllElements = () => {
      currentDisplayElements.forEach((elem) => {
        elem.alpha = 1;
      });
      currentDisplayElements = [];
      dialogueFullyRevealed = true;
      // Hide the indicator if this is the final dialogue.
      if (currentDialogueIndex === dialogues.length - 1) {
        continueIndicator.visible = false;
      } else {
        continueIndicator.visible = true;
      }
    };

    // Function to show one dialogue line with gradual letter-by-letter reveal.
    const showDialogue = (index: number) => {
      contentContainer.removeChildren();
      // Reset reveal state.
      dialogueFullyRevealed = false;
      currentDisplayElements = [];
      // Show the continue indicator only if this isn't the final dialogue.
      if (index === dialogues.length - 1) {
        continueIndicator.visible = false;
      } else {
        continueIndicator.visible = true;
      }

      if (index >= dialogues.length) {
        return;
      }

      const dialogue = dialogues[index];
      const margin = 10;
      const boxWidth = dialogueBG.width; // 700
      const avatarWidth = 60;
      const avatarHeight = 60;

      // Determine avatar placement based on "position" parameter.
      let isAvatarRight = false;
      let avatarData = avatarMap[dialogue.name];
      if (avatarData && avatarData.position.toLowerCase() === "right") {
        isAvatarRight = true;
      }

      let nameTextX = margin;
      let wrapWidth = boxWidth - margin * 2; // default full width area

      if (avatarData) {
        if (isAvatarRight) {
          // Draw avatar on the right side.
          const avatarSprite = PIXI.Sprite.from(avatarData.url);
          avatarSprite.width = avatarWidth;
          avatarSprite.height = avatarHeight;
          avatarSprite.x = boxWidth - avatarWidth - margin;
          avatarSprite.y = 45;
          contentContainer.addChild(avatarSprite);
          nameTextX = margin;
          wrapWidth = boxWidth - avatarWidth - margin * 3;
        } else {
          // Left avatar: draw on left side.
          const avatarSprite = PIXI.Sprite.from(avatarData.url);
          avatarSprite.width = avatarWidth;
          avatarSprite.height = avatarHeight;
          avatarSprite.x = margin;
          avatarSprite.y = 45;
          contentContainer.addChild(avatarSprite);
          nameTextX = avatarSprite.x + avatarWidth + margin;
          wrapWidth = boxWidth - nameTextX - margin;
        }
      }

      // Render speaker's name.
      const nameStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0xffffff,
        fontWeight: 'bold',
      });
      const nameText = new PIXI.Text(dialogue.name + ":", nameStyle);
      nameText.x = nameTextX;
      nameText.y = 20;
      contentContainer.addChild(nameText);

      // Parse dialogue text into segments.
      const textSegments = parseDialogueText(dialogue.text);

      // Determine text area start position.
      const textStartX = isAvatarRight ? margin : nameText.x;
      const textStartY = nameText.y + nameText.height + 5;
      const lineHeight = 26;
      const boundaryX = textStartX + wrapWidth;

      // Layout letters and emojis into currentDisplayElements.
      layoutSegments(
        textSegments,
        contentContainer,
        baseTextStyle,
        emojiMap,
        textStartX,
        textStartY,
        boundaryX,
        lineHeight,
        currentDisplayElements
      );

      // Gradually reveal each letter/emoji one by one (3ms per element).
      revealElementsGradually(currentDisplayElements, 3);
    };

    // Fetch dialogue data.
    fetch('https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch dialogue data.');
        return res.json();
      })
      .then((data: MagicWordsData) => {
        dialogues = data.dialogue;
        data.emojies.forEach((emoji) => {
          emojiMap[emoji.name] = emoji.url;
        });
        data.avatars.forEach((avatar) => {
          avatarMap[avatar.name] = avatar;
        });
        showDialogue(currentDialogueIndex);
      })
      .catch((err) => {
        const errorText = new PIXI.Text("Error: " + err.message, {
          fontFamily: 'Arial',
          fontSize: 20,
          fill: 0xff0000,
        });
        errorText.x = 20;
        errorText.y = 20;
        app.stage.addChild(errorText);
      });

    // Advance dialogue on click or Enter.
    const advanceDialogue: () => void = () => {
      if (!dialogueFullyRevealed) {
        // If not fully revealed, reveal all immediately.
        revealAllElements();
        return;
      }
      // If we're on the final dialogue (which shows without the indicator), do nothing.
      if (currentDialogueIndex === dialogues.length - 1) {
        return;
      }
      // Otherwise, advance to the next dialogue.
      if (currentDialogueIndex < dialogues.length - 1) {
        currentDialogueIndex++;
        showDialogue(currentDialogueIndex);
      }
    };

    const canvas = app.view as HTMLCanvasElement;
    if (canvas) {
      canvas.addEventListener('pointerdown', advanceDialogue);
    }
    const keyListener = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        advanceDialogue();
      }
    };
    window.addEventListener('keydown', keyListener);

    // Cleanup on unmount.
    return () => {
      canvas.removeEventListener('pointerdown', advanceDialogue);
      window.removeEventListener('keydown', keyListener);
      app.destroy(true, { children: true });
    };
  }, []);

  return <div ref={containerRef} />;
};

export default TechDemo2;
