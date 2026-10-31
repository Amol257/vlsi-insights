const fs = require('fs');
const path = require('path');

const files = [
  path.resolve('c:/Users/acer/Desktop/Antigravity/WORK/VLSI Insights/frontend/pages/programs.html'),
  path.resolve('c:/Users/acer/Desktop/Antigravity/WORK/VLSI Insights - Copy/frontend/pages/programs.html')
];

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log('Skipping missing:', file);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');

  // 1. Declare pendingBrochureAction
  if (!content.includes('let pendingBrochureAction = null;')) {
    content = content.replace(
      'let pendingProgramToCart = null;',
      'let pendingProgramToCart = null;\n    let pendingBrochureAction = null;'
    );
  }

  // 2. Gate openBrochureModal
  const oldOpenBrochureRegex = /function openBrochureModal\(brochurePath, title\) \{\s*if \(!brochureModal \|\| !brochurePath\) return;/;
  const newOpenBrochure = `function openBrochureModal(brochurePath, title) {
      if (!brochureModal || !brochurePath) return;

      // Gate: Must be logged in to view/download brochure
      const user = getSyncAuthUser();
      if (!user) {
        openAuthModal(null, 'signup', { path: brochurePath, title: title || 'Course Brochure' });
        return;
      }`;
  content = content.replace(oldOpenBrochureRegex, newOpenBrochure);

  // 3. Gate direct download button in brochure modal
  if (!content.includes("brochureDownloadDirect.addEventListener('click'")) {
    const directDownloadGate = `\n    if (brochureDownloadDirect) {
      brochureDownloadDirect.addEventListener('click', (e) => {
        const user = getSyncAuthUser();
        if (!user) {
          e.preventDefault();
          const path = brochureDownloadDirect.href;
          const title = brochureModalTitle ? brochureModalTitle.textContent : 'Course Brochure';
          closeBrochureModal();
          openAuthModal(null, 'signup', { path, title });
        }
      });
    }\n`;
    content = content.replace(
      'if (closeBrochureModalBtn) closeBrochureModalBtn.addEventListener(\'click\', closeBrochureModal);',
      directDownloadGate + '    if (closeBrochureModalBtn) closeBrochureModalBtn.addEventListener(\'click\', closeBrochureModal);'
    );
  }

  // 4. Update openAuthModal to support mode ('signin' | 'signup') and brochureAction
  const oldOpenAuthModalRegex = /function openAuthModal\(item\) \{\s*if \(item\) \{[\s\S]*?\}\s*clearModalAlerts\(\);[\s\S]*?if \(modalSignInForm\) modalSignInForm\.style\.display = 'flex';[\s\S]*?if \(modalSignUpForm\) modalSignUpForm\.style\.display = 'none';[\s\S]*?if \(authModalTitle\) authModalTitle\.textContent = 'Hi, Welcome back!';[\s\S]*?if \(authModalSubtitle\) \{[\s\S]*?\}\s*if \(authModalBackdrop\) \{/;

  const newOpenAuthModal = `function openAuthModal(item, mode = 'signin', brochureAction = null) {
      if (item) {
        pendingProgramToCart = item;
        try {
          sessionStorage.setItem('pending_cart_item', JSON.stringify(item));
        } catch (e) {}
      }
      if (brochureAction) {
        pendingBrochureAction = brochureAction;
      }
      clearModalAlerts();

      if (mode === 'signup') {
        if (modalSignInForm) modalSignInForm.style.display = 'none';
        if (modalSignUpForm) modalSignUpForm.style.display = 'flex';
        if (authModalTitle) authModalTitle.textContent = 'Create an Account';
        if (authModalSubtitle) {
          authModalSubtitle.textContent = brochureAction && brochureAction.title
            ? \`Sign up to view and download the official brochure for "\${brochureAction.title}".\`
            : 'Sign up to view and download course brochures.';
        }
      } else {
        if (modalSignInForm) modalSignInForm.style.display = 'flex';
        if (modalSignUpForm) modalSignUpForm.style.display = 'none';
        if (authModalTitle) authModalTitle.textContent = 'Hi, Welcome back!';
        if (authModalSubtitle) {
          if (brochureAction && brochureAction.title) {
            authModalSubtitle.textContent = \`Sign in to view and download the official brochure for "\${brochureAction.title}".\`;
          } else if (item && item.name) {
            authModalSubtitle.textContent = \`Sign in to add "\${item.name}" to your cart and enroll.\`;
          } else {
            authModalSubtitle.textContent = 'Sign in to add courses to your cart and enroll.';
          }
        }
      }

      if (authModalBackdrop) {`;
  content = content.replace(oldOpenAuthModalRegex, newOpenAuthModal);

  // 5. Update onAuthSuccessComplete to handle pendingBrochureAction
  const oldOnAuthSuccessRegex = /function onAuthSuccessComplete\(\) \{\s*if \(pendingProgramToCart\) \{[\s\S]*?\}\s*showModalSuccess\('Signed in successfully! Redirecting to cart\.\.\.'\);/;
  const newOnAuthSuccess = `function onAuthSuccessComplete() {
      if (pendingBrochureAction) {
        const action = pendingBrochureAction;
        pendingBrochureAction = null;
        closeAuthModal();
        openBrochureModal(action.path, action.title);
        return;
      }
      if (pendingProgramToCart) {
        addToCart(pendingProgramToCart);
        try { sessionStorage.removeItem('pending_cart_item'); } catch (e) {}
      }
      showModalSuccess('Signed in successfully! Redirecting to cart...');`;
  content = content.replace(oldOnAuthSuccessRegex, newOnAuthSuccess);

  // 6. Update switchToSignUpBtn and switchToSignInBtn subtitles
  content = content.replace(
    "authModalSubtitle.textContent = 'Join VLSI Insights to enroll in semiconductor tracks.';",
    "authModalSubtitle.textContent = pendingBrochureAction ? `Sign up to view and download \"${pendingBrochureAction.title}\" brochure.` : 'Join VLSI Insights to enroll in semiconductor tracks.';"
  );
  content = content.replace(
    ": 'Sign in to add courses to your cart and enroll.';",
    ": (pendingBrochureAction ? `Sign in to view and download \"${pendingBrochureAction.title}\" brochure.` : 'Sign in to add courses to your cart and enroll.');"
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated brochure signup gate in:', file);
});
