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
      - generic [ref=e36]: Profile image (optional)
      - button "Choose File" [ref=e37]
    - button "Register" [ref=e38] [cursor=pointer]
    - generic [ref=e39]:
      - button "Previous" [ref=e40] [cursor=pointer]
      - button "Next" [disabled] [ref=e41]
  - paragraph [ref=e42]:
    - text: Already have an account?
    - link "Login here" [ref=e43] [cursor=pointer]:
      - /url: /login
```