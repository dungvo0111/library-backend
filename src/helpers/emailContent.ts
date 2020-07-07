export const emailContent = (name: string, link: string) =>
  `Hi <strong>${name}</strong>,
    <br/><br/>
    You recently requested to reset your password. This password reset is only valid for the next <strong>1 hour</strong>.
    <br/>
    Link to reset your password: <strong><a href=${link}>link</a></strong>
    <br /><br/>

    Thanks,
    <br/><br/>
    DV Library Team`
