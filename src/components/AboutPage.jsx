import React, { useState, useEffect } from 'react';
import useAboutPageContent from '../hooks/useAboutPageContent';
import '../styles/about-page.css';

const AboutPage = ({ onBack }) => {
  const { generateSectionImage, generateDreamersFantasyImage, generatedImages, loadingStates } = useAboutPageContent();

  useEffect(() => {
    // Auto-generate images only if they don't exist yet
    const generateAllImages = async () => {
      const imagePrompts = {
        fantasyworldhub: 'Magical portal hub connecting multiple fantasy worlds, floating islands, mystical architecture, infinite possibilities, creative sanctuary',
        whyai: 'Human and AI collaboration, creative partnership, digital art creation, innovation and imagination, futuristic creative workspace',
        aifuture: 'Future of AI and creativity, humans and AI working together, creative revolution, technological advancement, bright optimistic future'
      };

      // Generate regular images
      Object.entries(imagePrompts).forEach(([section, prompt], index) => {
        if (!generatedImages[section]) {
          setTimeout(() => {
            generateSectionImage(section, prompt);
          }, index * 500);
        }
      });

      // Generate special Dreamer's Journey fantasy comic if not exists
      if (!generatedImages.personal) {
        setTimeout(() => {
          generateDreamersFantasyImage();
        }, 1500);
      }
    };

    generateAllImages();
  }, [generateSectionImage, generateDreamersFantasyImage, generatedImages]);

  return (
    <div className="about-page">
      <div className="about-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Hub
        </button>
        <h1>About</h1>
      </div>

      <div className="about-content">
        <div className="profile-section image-left">
          <div className="profile-image">
            {generatedImages.profile ? (
              <img src={generatedImages.profile.url} alt="Chandan Draksha - Professional" />
            ) : (
              <img src="/images/chandan-profile.jpg" alt="Chandan Draksha" />
            )}
          </div>
          <div className="profile-info">
            <h2>Chandan Draksha</h2>
            <p className="professional-bio">
              I'm a product-focused technologist with a double major in Mathematics and Statistics from Purdue University, 
              and a certificate in Entrepreneurship and Innovation. I've worked across backend systems, API testing, data analysis, 
              and research-driven prototyping, building mathematical models and secure content workflows. I'm passionate about 
              combining logic, creativity, and technology to solve meaningful problems, especially at the intersection of data, 
              systems, and human behavior. Now I'm building my own ventures from the ground up — driven by curiosity, 
              first-principles thinking, and a strong bias for execution.
            </p>
            <div className="profile-buttons">
              <a href="https://www.linkedin.com/in/chandandraksha/" target="_blank" rel="noopener noreferrer" className="linkedin-link">
                Connect on LinkedIn →
              </a>
              <button className="deck-button" onClick={() => window.open('?experience=deck', '_blank')}>
                Check out the deck →
              </button>
            </div>
          </div>
        </div>

        <div className="personal-section">
          <div className="section-content">
            <h3>The Dreamer's Journey</h3>
            <p className="personal-story">
              From a young age, I've been a relentless daydreamer and deeply creative soul. While other kids were focused on the 
              immediate world around them, I was lost in vast imaginary universes, crafting elaborate stories in my mind and 
              living through countless adventures before breakfast. I was utterly obsessed with superheroes — not just the powers 
              and costumes, but the intricate mythologies, the moral complexities, and the way these characters represented our 
              highest aspirations and deepest fears. I devoured comic books, analyzed every superhero origin story, and spent 
              hours imagining what powers I would have and how I'd use them to change the world. This fascination extended into 
              epic fantasy realms — I was completely captivated by Tolkien's Middle-earth, spending countless hours reading and 
              re-reading The Lord of the Rings, studying the maps, learning about the different races and their histories. 
              Game of Thrones became another obsession, with its complex political intrigue and morally gray characters that 
              felt so much more real than traditional fantasy. I was drawn to stories that built entire worlds with their own 
              rules, languages, and cultures. History fascinated me just as much as fiction — ancient civilizations, great 
              battles, the rise and fall of empires, the stories of individuals who shaped the course of human events. 
              I realized that the line between history and fantasy wasn't as clear as people thought; both were about 
              understanding human nature, exploring possibilities, and imagining how things could be different. This lifelong 
              love of storytelling, world-building, and creative exploration has shaped everything I do, from how I approach 
              problem-solving in technology to how I envision the future of human potential.
            </p>
          </div>
          <div className="section-image">
            {loadingStates.personal ? (
              <div className="loading-spinner"></div>
            ) : generatedImages.personal ? (
              <div>
                <img src={generatedImages.personal.url} alt="The Dreamer's Journey" />
                <button 
                  onClick={() => generateDreamersFantasyImage()}
                  disabled={loadingStates.personal}
                  className="generate-another-btn"
                >
                  {loadingStates.personal ? '🎨 Generating...' : '🔄 Generate Fantasy Comic'}
                </button>
              </div>
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">🎨</div>
              </div>
            )}
          </div>
        </div>

        <div className="fantasyworldhub-section">
          <div className="section-image">
            {loadingStates.fantasyworldhub ? (
              <div className="loading-spinner"></div>
            ) : generatedImages.fantasyworldhub ? (
              <div>
                <img src={generatedImages.fantasyworldhub.url} alt="About FantasyWorldHub" />
                <button 
                  onClick={() => generateSectionImage('fantasyworldhub', 'Magical portal hub connecting multiple fantasy worlds, floating islands, mystical architecture, infinite possibilities, creative sanctuary')}
                  disabled={loadingStates.fantasyworldhub}
                  className="generate-another-btn"
                >
                  {loadingStates.fantasyworldhub ? '🎨 Generating...' : '🔄 Generate Another Image'}
                </button>
              </div>
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">🎨</div>
              </div>
            )}
          </div>
          <div className="section-content">
            <h3>About FantasyWorldHub</h3>
            <p>
              FantasyWorldHub represents the culmination of my belief that imagination is humanity's greatest untapped resource. 
              In a world increasingly focused on optimization, efficiency, and measurable outcomes, we've somehow forgotten 
              that our most profound breakthroughs — in science, art, technology, and human understanding — have always 
              begun with someone daring to dream of something that didn't yet exist. FantasyWorldHub is designed as a sanctuary 
              for that essential human capacity, a place where the boundaries between reality and possibility dissolve, 
              and where your mind can explore territories that conventional thinking would never reach.
            </p>
            <p>
              Each experience in this collection is carefully crafted to challenge your assumptions, expand your perspective, 
              and help you discover new ways of seeing and thinking. Whether you're exploring impossible architectures, 
              conversing with historical figures in futuristic settings, or diving into interactive simulations of 
              fantastical worlds, you're engaging in a form of mental training that strengthens your ability to 
              envision and create new realities. FantasyWorldHub is my contribution to a future where human creativity 
              and imagination are recognized not as luxuries, but as essential tools for solving the complex challenges 
              we face and unlocking the extraordinary potential that lies dormant within each of us.
            </p>
          </div>
        </div>

        <div className="why-ai-section">
          <div className="section-content">
            <h3>Why AI?</h3>
            <p>
              The choice to use AI in creating these experiences isn't about replacing human creativity — it's about amplifying it. 
              AI serves as an incredibly powerful creative partner that can generate infinite variations, explore impossible scenarios, 
              and bring fantastical concepts to life in ways that would be prohibitively expensive or time-consuming through traditional means. 
              When I envision a crystal tower reaching into the clouds with floating gardens, or glasses that can see impossible colors, 
              AI can instantly visualize these concepts with stunning detail and artistic quality.
            </p>
            <p>
              More importantly, AI democratizes imagination. It removes the barriers between having a wild idea and seeing it realized. 
              You don't need to be an artist, programmer, or filmmaker to explore these worlds — you just need curiosity and wonder. 
              AI handles the technical execution while you focus on the creative exploration. This partnership between human imagination 
              and artificial intelligence creates a new form of interactive storytelling where the boundaries of what's possible are 
              limited only by our ability to dream. Each experience becomes a collaborative creation between your mind, my vision, 
              and AI's generative capabilities, resulting in something none of us could have created alone.
            </p>
          </div>
          <div className="section-image">
            {loadingStates.whyai ? (
              <div className="loading-spinner"></div>
            ) : generatedImages.whyai ? (
              <div>
                <img src={generatedImages.whyai.url} alt="Why AI?" />
                <button 
                  onClick={() => generateSectionImage('whyai', 'Human and AI collaboration, creative partnership, digital art creation, innovation and imagination, futuristic creative workspace')}
                  disabled={loadingStates.whyai}
                  className="generate-another-btn"
                >
                  {loadingStates.whyai ? '🎨 Generating...' : '🔄 Generate Another Image'}
                </button>
              </div>
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">🎨</div>
              </div>
            )}
          </div>
        </div>

        <div className="ai-future-section">
          <div className="section-image">
            {loadingStates.aifuture ? (
              <div className="loading-spinner"></div>
            ) : generatedImages.aifuture ? (
              <div>
                <img src={generatedImages.aifuture.url} alt="The Future of AI and Creativity" />
                <button 
                  onClick={() => generateSectionImage('aifuture', 'Future of AI and creativity, humans and AI working together, creative revolution, technological advancement, bright optimistic future')}
                  disabled={loadingStates.aifuture}
                  className="generate-another-btn"
                >
                  {loadingStates.aifuture ? '🎨 Generating...' : '🔄 Generate Another Image'}
                </button>
              </div>
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">🎨</div>
              </div>
            )}
          </div>
          <div className="section-content">
            <h3>The Future of AI and Creativity</h3>
            <p>
              We stand at the threshold of a creative revolution. AI is not just a tool—it's becoming humanity's most powerful 
              creative collaborator, capable of understanding nuance, generating infinite possibilities, and helping us explore 
              ideas we never thought possible. The future belongs to those who learn to dance with artificial intelligence, 
              using it not to replace human creativity but to amplify our imaginative potential beyond all previous limits.
            </p>
            <p>
              In the coming decades, the ability to effectively collaborate with AI will become as fundamental as literacy itself. 
              Those who master this partnership will be able to bring any vision to life—whether it's designing impossible 
              architectures, crafting immersive narratives, or solving complex problems through creative synthesis. FantasyWorldHub 
              is training ground for this future, where you can develop the creative fluency and imaginative confidence needed 
              to thrive in an AI-augmented world. The question isn't whether AI will transform creativity—it's whether you'll 
              be ready to lead that transformation.
            </p>
          </div>
        </div>


      </div>
      
      {/* Model Attribution */}
      <div className="model-attribution">
        <p>All Images are generated using Segmind's Nano Banana</p>
      </div>
    </div>
  );
};

export default AboutPage;
