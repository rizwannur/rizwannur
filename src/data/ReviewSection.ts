
import { StaticImageData } from "next/image";
import jerry from "../../public/jerry.avif";
import samuel from "../../public/samuel.avif";
import olamide from "../../public/olamide.jpeg";
import umar from "../../public/umar.jpeg";
import mauro from "../../public/mauro.jpeg";
import alan from "../../public/alan.jpeg";

interface Review {
  name: string;
  role: string;
  company: string;
  profileImg: StaticImageData;
  testimonial: string;
}

export const reviewsTitle = "Testimonials";
export const reviewsDescription =
  "Real Stories from Clients and Collaborators Who Have Experienced My Work Firsthand";

export const reviews: Review[] = [
  {
    name: "Samuel Oladokun",
    role: "Product Designer",
    company: "Propellent",
    profileImg: samuel,
    testimonial:
      "Working with Victor was an absolute pleasure. His attention to detail and commitment to quality are second to none. He took my vision and turned it into a stunning reality, exceeding all my expectations. I can't recommend him enough.",
  },
  {
    name: "Olamide Olateju",
    role: "Senior Developer",
    company: "Tech Solutions",
    profileImg: olamide,
    testimonial:
      "I had the privilege of collaborating with Victor on a project, and I was blown away by his talent and professionalism. He is a true master of his craft, and his passion for design is evident in every aspect of his work. I would jump at the chance to work with him again.",
  },
  {
    name: "Umar",
    role: "Creative Director",
    company: "Design Studio",
    profileImg: umar,
    testimonial:
      "Victor is a game-changer. His innovative ideas and creative solutions transformed my project from ordinary to extraordinary. He is a true visionary, and I am so grateful for his contributions. I would recommend him to anyone looking for a top-notch designer.",
  },
  {
    name: "Mauro Towsend",
    role: "CEO",
    company: "Digital Agency",
    profileImg: mauro,
    testimonial:
      "I was so impressed with Victor's work. He is a true professional, and his work is simply outstanding. He was able to take my ideas and turn them into a beautiful, functional design that I am absolutely thrilled with. I would recommend him to anyone.",
  },
  {
    name: "Jerry Syre",
    role: "Business Owner",
    company: "Local Business",
    profileImg: jerry,
    testimonial:
      "I hired Victor to create a new website for my business, and I couldn't be happier with the results. He was able to capture the essence of my brand and create a site that is both visually appealing and easy to navigate. I would highly recommend him to anyone looking for a talented web designer.",
  },
  {
    name: "Alan Turing",
    role: "Tech Consultant",
    company: "Independent",
    profileImg: alan,
    testimonial:
      "I am so grateful to Victor for his hard work and dedication. He went above and beyond to make sure that I was happy with the final product. He is a true professional, and I would recommend him to anyone.",
  },
];

/**
 * Validates a review object
 * @param review The review to validate
 * @returns True if the review is valid, false otherwise
 */
export function validateReview(review: Partial<Review>): review is Review {
  return (
    review.name !== undefined &&
    review.role !== undefined &&
    review.company !== undefined &&
    review.testimonial !== undefined &&
    review.profileImg !== undefined &&
    typeof review.name === "string" &&
    typeof review.role === "string" &&
    typeof review.company === "string" &&
    typeof review.testimonial === "string"
  );
}
