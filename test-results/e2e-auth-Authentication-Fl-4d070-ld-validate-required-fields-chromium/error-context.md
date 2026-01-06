# Page snapshot

```yaml
- generic [ref=e5]:
  - img "Company Logo" [ref=e8]
  - link " Back to Home" [ref=e10] [cursor=pointer]:
    - /url: /
    - generic [ref=e11]: 
    - text: Back to Home
  - heading "Create Account" [level=2] [ref=e12]
  - generic [ref=e15]:
    - button "Sign in with Google. Opens in new tab" [ref=e17] [cursor=pointer]:
      - generic [ref=e19]:
        - img [ref=e21]
        - generic [ref=e28]: Sign in with Google
    - iframe
  - generic [ref=e29]: Or with email
  - generic [ref=e34]:
    - generic [ref=e35]:
      - textbox "Full Name" [ref=e36]
      - generic [ref=e37]: Letters only, no spaces or numbers
    - generic [ref=e38]:
      - textbox "Email Address" [ref=e39]
      - generic [ref=e40]: We'll send confirmations here
    - generic [ref=e41]:
      - textbox "Phone Number" [ref=e42]
      - generic [ref=e43]: 10-digit Indian mobile number (6,7,8,9)
    - button "Register" [disabled] [ref=e44]
    - generic [ref=e45]:
      - button "Previous" [disabled] [ref=e46]
      - button "Next" [disabled] [ref=e47]
  - paragraph [ref=e48]:
    - text: Already have an account?
    - link "Login here" [ref=e49] [cursor=pointer]:
      - /url: /login
```